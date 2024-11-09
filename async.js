const getRandomNUmber = (callback) => {
  setTimeout(() => {
    let randomNumber = Math.random();
    callback(randomNumber);
  })
}
const cb = (number) => {
  console.log(number);
}

console.log(getRandomNUmber(cb));

