// ==UserScript==
// @name         Show remaining slack hours
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Show remaining slack hours
// @author       You
// @match        https://vault.infi.nl/uren/invoer.php*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    const minutesPerWeek = 32 * 60;
    const maxNonBillableMinutes = minutesPerWeek * 0.25;
    const currentWeek = weeks[weeks.length - 1];
    const nonBillableMinutesLeft = maxNonBillableMinutes - parseTime(currentWeek.niet_facturabel_value)

    const header = document.querySelector(".facturabiliteit-header");
    header.innerText = header.innerText + ` [OVER: ${formatTime(nonBillableMinutesLeft)}]`;

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
        while (str.length < 2) {
            str = "0" + str;
        }
        return str;
    }
})();