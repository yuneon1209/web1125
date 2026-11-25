"use strict";

const spreadsheetNamespace = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const relationshipNamespace = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const workbookType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const excelStyle = { normal: 0, title: 1, heading: 2, amount: 3, note: 4, total: 5 };

function escapeWorkbookText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function travelWorksheet(result) {
  const { normal, title, heading, amount, note, total } = excelStyle;
  const rows = [];
  const merged = [];

  function addRow(values, styles = [], { merge = false, height = 20 } = {}) {
    const index = rows.length + 1;
    if (merge) merged.push(`<mergeCell ref="A${index}:B${index}"/>`);
    const cells = values.map((value, column) => {
      const address = `${"AB"[column]}${index}`;
      const style = styles[column] ?? normal;
      if (typeof value === "number") return `<c r="${address}" s="${style}"><v>${value}</v></c>`;
      const content = escapeWorkbookText(value);
      return `<c r="${address}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${content}</t></is></c>`;
    });
    rows.push(`<row r="${index}" ht="${height}" customHeight="1">${cells.join("")}</row>`);
  }

  addRow(["국내 출장여비 계산 결과"], [title], { merge: true, height: 30 });
  addRow(["예상 지급액 (원)", result.total], [heading, total]);
  addRow([]);
  addRow(["출장 유형", result.type]);
  addRow(["출장일", result.departure]);
  addRow(["복귀일", result.returnDate]);
  addRow(["출장 일수", result.days]);
  if (result.grade) addRow(["여비 지급 구분", result.grade]);
  addRow([]);
  addRow(["지급 항목", "금액 (원)"], [heading, heading]);
  for (const item of result.items) addRow(item, [normal, amount]);
  if (result.notes.length) {
    addRow([]);
    addRow(["적용 사항"], [heading], { merge: true });
    for (const text of result.notes) {
      addRow([text], [note], { merge: true, height: 18 * Math.ceil(text.length / 34) });
    }
  }

  return `<worksheet xmlns="${spreadsheetNamespace}">
  <cols><col min="1" max="1" width="27" customWidth="1"/><col min="2" max="2" width="47" customWidth="1"/></cols>
  <sheetData>${rows.join("")}</sheetData>
  <mergeCells count="${merged.length}">${merged.join("")}</mergeCells>
</worksheet>`;
}

async function createTravelWorkbook(result) {
  const zip = new JSZip();
  const parts = {
    "[Content_Types].xml": `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="${workbookType}.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`,
    "_rels/.rels": `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="${relationshipNamespace}/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    "xl/workbook.xml": `<workbook xmlns="${spreadsheetNamespace}" xmlns:r="${relationshipNamespace}">
  <sheets><sheet name="출장여비" sheetId="1" r:id="rId1"/></sheets>
</workbook>`,
    "xl/_rels/workbook.xml.rels": `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="${relationshipNamespace}/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="${relationshipNamespace}/styles" Target="styles.xml"/>
</Relationships>`,
    "xl/styles.xml": `<styleSheet xmlns="${spreadsheetNamespace}">
  <fonts count="3">
    <font><sz val="11"/><name val="맑은 고딕"/></font>
    <font><b/><sz val="16"/><name val="맑은 고딕"/></font>
    <font><b/><sz val="11"/><name val="맑은 고딕"/></font>
  </fonts>
  <fills count="3">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE1F1E8"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="6">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>
    <xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/>
    <xf numFmtId="3" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="3" fontId="2" fillId="2" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1"/>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`,
    "xl/worksheets/sheet1.xml": travelWorksheet(result),
  };
  for (const [path, xml] of Object.entries(parts)) zip.file(path, xmlDeclaration + xml);
  return zip.generateAsync({ type: "blob", mimeType: workbookType, compression: "DEFLATE" });
}
