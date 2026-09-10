/*
 * 축 눈금 고르기.
 *
 * 데이터의 최소·최대를 그대로 축 끝으로 쓰면 눈금이 703727.89 같은 숫자로
 * 붙는다. 사람은 그런 숫자를 읽지 않는다 — 1, 2, 2.5, 5, 10 의 배수로
 * 떨어지는 자리에 눈금을 두면 값을 눈으로 어림할 수 있다.
 */
const niceStep = raw => {
  if (!(raw > 0)) {
    return 1;
  }
  const exponent = Math.floor(Math.log10(raw));
  const magnitude = Math.pow(10, exponent);
  const fraction = raw / magnitude;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10;
  return nice * magnitude;
};

/**
 * 값 범위를 눈금이 예쁘게 떨어지는 범위로 넓힌다.
 *
 * @param values  숫자 배열 (null 은 미리 걸러서 넣을 것)
 * @param count   원하는 눈금 칸 수 (실제 개수는 ±1 달라질 수 있다)
 * @param zeroBased  막대처럼 0 에서 시작해야 하는가
 * @param integer  세는 값인가. "블록당 트랜잭션 0.25건"은 있을 수 없는 눈금이다.
 */
export const niceScale = (values, count = 4, zeroBased = false, integer = false) => {
  const clean = values.filter(v => typeof v === "number" && isFinite(v));
  if (clean.length === 0) {
    return { min: 0, max: 1, ticks: [0, 1] };
  }

  let lo = Math.min.apply(null, clean);
  let hi = Math.max.apply(null, clean);

  if (zeroBased || (lo > 0 && lo < (hi - lo) * 0.4)) {
    // 0 에 가까운 값이 섞여 있으면 0 에서 시작하는 편이 덜 헷갈린다
    lo = 0;
  }

  if (hi === lo) {
    // 평평한 계열. 선이 축에 딱 붙지 않게 위아래로 조금 벌린다.
    hi = lo === 0 ? 1 : lo + Math.abs(lo) * 0.1;
  }

  let step = niceStep((hi - lo) / Math.max(1, count));
  if (integer) {
    step = Math.max(1, Math.round(step));
  }
  const min = Math.floor(lo / step) * step;
  const max = Math.ceil(hi / step) * step;

  const ticks = [];
  /*
   * 부동소수 누적 오차 때문에 min 에 step 을 계속 더하면 마지막 눈금이
   * 999.9999 로 떨어진다. 정수 번째를 곱해서 만든다.
   */
  const steps = Math.round((max - min) / step);
  for (let i = 0; i <= steps; i++) {
    ticks.push(min + step * i);
  }

  return { min, max, ticks };
};

// 큰 수를 축에 적을 때: 1234567 -> "1.2M"
export const shortNumber = value => {
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${(value / 1e12).toFixed(abs >= 1e13 ? 0 : 1)}T`;
  if (abs >= 1e9) return `${(value / 1e9).toFixed(abs >= 1e10 ? 0 : 1)}G`;
  if (abs >= 1e6) return `${(value / 1e6).toFixed(abs >= 1e7 ? 0 : 1)}M`;
  if (abs >= 1e3) return `${(value / 1e3).toFixed(abs >= 1e4 ? 0 : 1)}k`;
  // 정수로 떨어지면 소수점을 붙이지 않는다
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
};

/*
 * 위 두 모서리만 둥근 막대.
 *
 * <rect rx> 는 네 모서리를 다 둥글게 만든다. 막대 아래쪽은 축에 붙어 있어야
 * 하므로 — 둥글면 값이 0 보다 커 보인다 — 경로로 직접 그린다.
 */
export const roundedTopBar = (x, y, width, height, radius) => {
  const r = Math.max(0, Math.min(radius, width / 2, height));
  if (height <= 0) {
    return "";
  }
  return [
    `M${x},${y + height}`,
    `L${x},${y + r}`,
    `Q${x},${y} ${x + r},${y}`,
    `L${x + width - r},${y}`,
    `Q${x + width},${y} ${x + width},${y + r}`,
    `L${x + width},${y + height}`,
    "Z"
  ].join(" ");
};
