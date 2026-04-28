/**
 * NEIS 기준 바이트 계산
 * 한글: 3바이트
 * 영문, 숫자, 공백: 1바이트
 */
export const calculateBytes = (text: string): number => {
  if (!text) return 0;
  
  let bytes = 0;
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    if (charCode > 127) {
      bytes += 3; // 한글 및 특수문자
    } else {
      bytes += 1; // 영문, 숫자, 공백
    }
  }
  return bytes;
};

export const MAX_BYTES = 1500; // 일반적인 교과세특 한도
