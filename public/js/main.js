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
        
        $('input[name="category"]').change(function () {
            if($(this).attr("value") == "Konferencja") {
                $('#error-date').show();
            } else if($(this).attr("value") == "Meetup") {
                $('#error-date').show();
            } else if($(this).attr("value") == "Warsztat") {
                $('#error-date').show();
            } else if($(this).attr("value") == "Webinar") {
                $('#error-date').show();
            } else {
                $('#error-date').hide();
            }
        });

        $('#error-name').click(function() {
            $('#new-error-name-label').hide();
            $(this).removeClass('error');
        });

        $('#error-desc').click(function() {
            $('#new-error-desc-label').hide();
            $(this).removeClass('error');
        });

        $('#error-web').click(function() {
            $('#new-error-web-label').hide();
            $(this).removeClass('error');
        });

        $('#error-img').click(function() {
            $('#new-error-img-label').hide();
            $(this).removeClass('error');
        });

        $('#error-cat').click(function() {
            $('#new-error-cat-label').hide();
            $(this).removeClass('error');
        });

        $('#error-tag').click(function() {
            $('#new-error-tag-label').hide();
            $(this).removeClass('error');
        });

        $('#error-date').click(function() {
            $('#new-error-date-label').hide();
            $(this).removeClass('error');
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

        $('#error-tag').click(function() {
            $('#error-tag-label').hide();
            $(this).removeClass('error');
        });

        $('#error-date').click(function() {
            $('#error-date-label').hide();
            $(this).removeClass('error');
        });

        $('#error-username').click(function() {
            $('#error-username-label').hide();
            $(this).removeClass('error');
        });

        $('#error-pssw').click(function() {
            $('#error-pssw-label').hide();
            $(this).removeClass('error');
        });

        $('#error-firstname').click(function() {
            $('#error-firstname-label').hide();
            $(this).removeClass('error');
        });

        $('#error-lastname').click(function() {
            $('#error-lastname-label').hide();
            $(this).removeClass('error');
        });

        $('#error-avatar').click(function() {
            $('#error-avatar-label').hide();
            $(this).removeClass('error');
        });

        $('#error-about').click(function() {
            $('#error-about-label').hide();
            $(this).removeClass('error');
        });

        $('.ui.massive.star.rating').click(function() {
            $('#error-review-label').hide();
        });

        $('.ui.massive.star.rating').click(function() {
            $('#error-review-edit-label').hide();
        });

        $('textarea[name="comment[text]"]').click(function() {
            $('#error-comment-label').hide();
            $('.ui.fourteen.wide.left.icon.input.error').removeClass('error');
        });

        $('textarea[placeholder="Edytuj komentarz..."]').click(function() {
            $('#error-comment-edit-label').hide();
            $('.ui.fourteen.wide.left.icon.input.error').removeClass('error');
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

        $('#file-input').change(function() {
            let files = document.getElementById('file-input').files,
                file = files[0];
            document.getElementById('image').value = file.name;
        });

        $courses = $('.hp-cards-grid');
        $courses.each(function() {
            var $hpCards = $(this).children();
            if ($hpCards.length > 8) {
                $courses.children(':nth-of-type(n+9)').hide();
                $(this).append('<button class="ui inverted button show-more">Zobacz kolejne</button>');
            }
        });
        $courses.on('click', '.show-more', function() {
            $(this).prevAll().show().end().remove();
        });

});