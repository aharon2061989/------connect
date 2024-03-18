
/**
 * Get date time object
 * @param {string|null} date 
 * @returns {{day: string, month: string, year: string, hours: string, minutes: string}}
 */
function getFormattedDateTime(date = null) {
    const d = date ? new Date(date) : new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return {
        day,
        month,
        year,
        hours,
        minutes
    }
  }


  module.exports = {getFormattedDateTime};