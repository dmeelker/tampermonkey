// ==UserScript==
// @name         Show remaining slack hours
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Show remaining slack hours
// @author       You
// @match        https://vault.infi.nl/uren/invoer.php*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const targetNonBillablePercentage = 0.25;
    const fullWorkWeek = 32 * 60;
    const targetNonBillableMinutes = Math.round(fullWorkWeek * targetNonBillablePercentage);
    const lastWeekBar = document.querySelectorAll(".facturabiliteit-balk")[5];
    const headerElement = document.querySelectorAll(".facturabiliteit-getal")[5];

    const nonbillableMinutes = parseTime(lastWeekBar.querySelector(".niet-facturabel").innerText);
    const nonBillableMinutesLeft = Math.max(targetNonBillableMinutes - nonbillableMinutes, 0);

    headerElement.innerText = headerElement.innerText + " (" + formatTime(nonBillableMinutesLeft) + " over)";

    function parseTime(input) {
        const parts = input.split(":");
        const hour = parseInt(parts[0]);
        const minute = parseInt(parts[1]);

        return (hour * 60) + minute;
    }

    function formatTime(inputMinutes) {
        inputMinutes = Math.round(inputMinutes);
        const hours = Math.floor(inputMinutes / 60);
        const minutes = inputMinutes % 60;
        return `${hours}:${pad(minutes)}`;
    }

    function pad(input) {
        let str = input.toString();
        while(str.length < 2) {
            str = "0" + str;
        }
        return str;
    }
})();