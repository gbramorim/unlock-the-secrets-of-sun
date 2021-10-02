function Sun() {
  function getCurrentDate() {
    let newDate = new Date();
    let date = newDate.getDate();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear();
    let hour = `${newDate.getHours()}:${newDate.getMinutes()}`;
    console.log(hour)
      
      
    return `${hour} - ${date}/${month}/${year}`;
  }

  return (
    <div className="sun-principal">
      <h1>{getCurrentDate()}</h1>
    </div>
  );
}

export default Sun;
