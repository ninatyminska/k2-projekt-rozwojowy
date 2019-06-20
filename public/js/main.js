$(document).ready(function() {
        $('.ui.dropdown')
            .dropdown();
        $('.ui.sidebar').sidebar('attach events', '.toc.item');
        $('.ui.accordion').accordion();
        $('.ui.calendar').calendar({
            type: 'datetime',
            ampm: false,
            firstDayOfWeek: 1,
            formatter: {
                date: function (date, settings) {
                    if (!date) return '';
                    var day = date.getDate();
                    var month = date.getMonth() + 1;
                    var year = date.getFullYear();
                    if(month<10) {
                        return year + '-' + 0 + month + '-' + day;
                    } else {
                         return year + '-' + month + '-' + day;
                    }
                } 
            },
            text: {
                days: ['ND', 'PON', 'WT', 'ŚR', 'CZW', 'PT', 'SB'],
                months: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
                monthsShort: ['Sty', 'Lut', 'Mar', 'Kw', 'Maj', 'Czer', 'Lip', 'Sier', 'Wrz', 'Paź', 'Lis', 'Gru'],
                today: 'Dzisiaj',
                now: 'Teraz',
                am: 'AM',
                pm: 'PM',
                weekNo: 'Tydzień'
              }
        });
        
        $('input[type="radio"]').click(function() {
            if($(this).attr("class") == "date") {
                $('#date').show();
            } else {
                $('#date').hide();
            }
        });
});