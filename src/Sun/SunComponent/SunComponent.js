import "./SunComponent.scss";
import ParkerSolarProbe from "../../assets/images/ParkerSolarProbe.png";

let newYearDate = new Date("Jan 1, 2022 00:00:00").getTime();

let todayDate = new Date().getTime();
let todaySecondsLeft = (newYearDate - todayDate) / 1000;
let todayDays = parseInt(todaySecondsLeft / 86400);

let plaDeg = parseInt(todayDays - 365);
let degMax = Math.abs(plaDeg) + 15;
let degMin = Math.abs(plaDeg) - 15;

let randMer = Math.floor(Math.random() * (degMax - degMin + 1)) + degMin;
let randVen = Math.floor(Math.random() * (degMax - degMin + 1)) + degMin;
let randMar = Math.floor(Math.random() * (degMax - degMin + 1)) + degMin;
let style = document.createElement("style");
style.innerHTML =
    ".orbit-mercury {transform: translate(-50%, -50%) rotate(" +
    randMer +
    "deg)} .orbit-venus {transform: translate(-50%, -50%) rotate(" +
    randVen +
    "deg)} .orbit-mars {transform: translate(-50%, -50%) rotate(" +
    randMar +
    "deg)} .planet-mercury {transform:rotate(-" +
    randMer +
    "deg)} .planet-venus {transform:rotate(-" +
    randVen +
    "deg)} .planet-mars {transform:rotate(-" +
    randMar +
    "deg)} .planet-earth {transform:rotate(" +
    parseInt(todayDays - 365) +
    "deg)} .planet-venus {transform:rotate(-" +
    randVen +
    "deg)} ";
document.head.appendChild(style);

let days, hours, minutes, seconds;

let countDown = setInterval(function () {
    let rightNow = new Date().getTime();
    let timeTo = newYearDate - rightNow;

    days = Math.floor(timeTo / (1000 * 60 * 60 * 24));
    hours = Math.floor((timeTo % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes = Math.floor((timeTo % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((timeTo % (1000 * 60)) / 1000);

    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;


    let opacityList = document.querySelectorAll(".planet");
    for (let i = 0; i < opacityList.length; i++) {
        opacityList[i].style.opacity = "1";
    }

    if (timeTo < 0) {
        clearInterval(countDown);
    }
}, 1000);

function SunComponent() {
    return (
        <>
            <div class="orbit orbit-sun"></div>
            <div class="orbit orbit-sun"></div>
            <div class="orbit orbit-mercury" id="position-mercury">
                <div class="planet planet-mercury" id="opacity-mercury">
                    <img src={ParkerSolarProbe} alt="ParkerSolarProbe" />
                </div>
            </div>
        </>
    );
}

export default SunComponent;
