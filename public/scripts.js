$(document).ready(function () { 

  const updateForm = document.getElementById('URLInfo__update__form__container');
  const formToggleButton = document.getElementById('URLInfo__update__form__button');

  $('#URLInfo__update__form__button').on('click', function(e) {
    $('#URLInfo__update__form__container').toggleClass('open');
  });

  $('#login__button').on('click', function(e) {
    e.preventDefault();
    $('#account-settings__container').toggleClass('open');
    $('#content__container').toggleClass('show__content');
    $('#login__button').toggleClass('selected');
  });

  $('#login__tab__button').on('click', function(e){ 
    e.preventDefault();
    $('#login__tab__button').toggleClass('selected');
    $('#auth__login__form').toggleClass('open');
    $('#signup__tab__button').removeClass('selected');
    $('#auth__signup__form').removeClass('open');
  });

  $('#signup__tab__button').on('click', function(e){ 
    e.preventDefault();
    $('#login__tab__button').removeClass('selected');
    $('#auth__login__form').removeClass('open');
    $('#signup__tab__button').toggleClass('selected');
    $('#auth__signup__form').toggleClass('open'); 
  });

});


  