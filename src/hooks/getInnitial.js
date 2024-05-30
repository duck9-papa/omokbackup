export function getAllInitials(str) {
  const INITIALS = [
    "ㄱ",
    "ㄲ",
    "ㄴ",
    "ㄷ",
    "ㄸ",
    "ㄹ",
    "ㅁ",
    "ㅂ",
    "ㅃ",
    "ㅅ",
    "ㅆ",
    "ㅇ",
    "ㅈ",
    "ㅉ",
    "ㅊ",
    "ㅋ",
    "ㅌ",
    "ㅍ",
    "ㅎ",
  ];

  const KOREAN_INITIAL_CODE = 44032; // 한글 시작 코드
  const KOREAN_FINAL_CODE = 55203; // 한글 마지막 코드

  let initials = "";
  for (let char of str) {
    const charCode = char.charCodeAt(0);
    if (charCode >= KOREAN_INITIAL_CODE && charCode <= KOREAN_FINAL_CODE) {
      const index = Math.floor((charCode - KOREAN_INITIAL_CODE) / 588);
      initials += INITIALS[index];
    } else {
      initials += char;
    }
  }
  return initials;
}
