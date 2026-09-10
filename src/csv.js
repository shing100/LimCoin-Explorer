/*
 * 표를 CSV 로 내려받게 한다.
 *
 * 왜 필요한가: 세금 신고나 회계 정리를 하는 사람은 화면을 보는 게 아니라
 * 엑셀에 붙여 넣어야 한다. 지금까지는 화면을 긁어 붙이는 수밖에 없었고,
 * 그러면 페이지마다 25건씩 손으로 모아야 했다.
 */

/*
 * 한 칸을 CSV 규칙(RFC 4180)에 맞춘다.
 *
 * 쉼표·따옴표·줄바꿈이 든 값은 통째로 따옴표로 감싸고, 안의 따옴표는 두 번
 * 적는다. 이걸 빼먹으면 주석 한 줄에 쉼표가 들어가는 순간 칸이 밀린다.
 */
const cell = value => {
  if (value === null || value === undefined) {
    return "";
  }
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const toCsv = (header, rows) =>
  [header]
    .concat(rows)
    .map(row => row.map(cell).join(","))
    // 엑셀은 CRLF 를 기대한다
    .join("\r\n");

/**
 * 만든 CSV 를 파일로 내려 준다.
 *
 * 앞에 BOM(﻿)을 붙인다. 없으면 엑셀이 한글 헤더를 CP949 로 읽어
 * "높이"가 "�믪씠"로 깨진다 — 파일은 멀쩡한데 사람은 못 쓴다.
 */
export const downloadCsv = (filename, header, rows) => {
  const blob = new Blob(["﻿", toCsv(header, rows)], {
    type: "text/csv;charset=utf-8"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // 바로 지우면 사파리에서 저장이 취소된다. 한 박자 뒤에 놓아 준다.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
