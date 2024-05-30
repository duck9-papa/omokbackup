const boardObj = {};

for (let i = 1; i <= 19 * 19; i++) {
  const row = Math.ceil(i / 19);
  const column = i % 19 || 19;
  boardObj[`${row}x${column}`] = null;
}

export default boardObj;

// {location :"1x1", order:1, side:"B" }
