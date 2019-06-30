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

        $('.ui.rating')
            .rating({
                maxRating: 5,
                onRate: function (rating) {
                $('input[type="hidden"]').attr('value', rating);
            }
        });
        
        $('input[type="hidden"]').change(function () {
            if($(this).attr("value") == "Konferencja") {
                $('#date').show();
            } else if($(this).attr("value") == "Meetup") {
                $('#date').show();
            } else if($(this).attr("value") == "Warsztat") {
                $('#error-date').show();
            } else {
                $('#error-date').hide();
            }
        });

        $('#error-name').click(function() {
            $('#error-name-label').hide();
            $(this).removeClass('error');
        });

        $('#error-desc').click(function() {
            $('#error-desc-label').hide();
            $(this).removeClass('error');
        });

        $('#error-web').click(function() {
            $('#error-web-label').hide();
            $(this).removeClass('error');
        });

        $('#error-img').click(function() {
            $('#error-img-label').hide();
            $(this).removeClass('error');
        });

        $('#error-cat').click(function() {
            $('#error-cat-label').hide();
            $(this).removeClass('error');
        });

        $('#error-date').click(function() {
            $('#error-date-label').hide();
            $(this).removeClass('error');
        });

        $('.ui.massive.star.rating').click(function() {
            $('#error-review-label').hide();
        });

        $(function() {
            var pathnameArr = location.pathname.split('/');
            switch (pathnameArr[1]) {
                case 'new':
                    $('div.pointing.menu a.home').removeClass('active');
                    $('div.pointing.menu a.item[href^="/' + location.pathname.split("/")[1] + '"]').addClass('active');
                    break;
                case 'c':
                    $('div.pointing.menu a.home').removeClass('active');
                    break;    
            }
        });

        $('.menu .item').tab();    
});