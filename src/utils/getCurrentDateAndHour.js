export default function getCurrentDateAndHour() {
  let newDate = new Date();
  let date = newDate.getDate();
  let month = newDate.getMonth() + 1;
  let year = newDate.getFullYear();
  let hour = `${newDate.getHours()}:${newDate.getMinutes()}`;

  return `${hour} - ${date}/${month}/${year}`;
}
