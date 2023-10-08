function doFold() {
  const wrapper = document.getElementById('fold-effect');
  const folds = Array.from(document.getElementsByClassName('fold'));
  const baseContent = document.getElementById('base-content');
  let state = {
    disposed: false,
    targetScroll: 0,
    scroll: 0
  };
  function lerp(current, target, speed = 1, limit = 1) {
    let change = (target - current) * speed;
    if (Math.abs(change) < limit) {
      change = target - current;
    }
    return change;
  }
  let scaleFix = 1;
  class FoldedDom {
    constructor(wrapper, folds = null, scrollers = null) {
      this.wrapper = wrapper;
      this.folds = folds;
      this.scrollers = [];
    }
    setContent(baseContent, createScrollers = true) {
      const folds = this.folds;
      if (!folds) return;
      let scrollers = [];
      for (let i = 0; i < folds.length; i++) {
        const fold = folds[i];
        const copyContent = baseContent.cloneNode(true);
        copyContent.id = '';
        let scroller;
        if (createScrollers) {
          let sizeFixEle = document.createElement('div');
          sizeFixEle.classList.add('fold-size-fix');
          scroller = document.createElement('div');
          scroller.classList.add('fold-scroller');
          sizeFixEle.append(scroller);
          fold.append(sizeFixEle);
        } else {
          scroller = this.scrollers[i];
        }
        scroller.append(copyContent);
        scrollers[i] = scroller;
      }
      this.scrollers = scrollers;
    }
    updateStyles(scroll, skewAmp, rotationAmp) {
      const folds = this.folds;
      const scrollers = this.scrollers;
      for (let i = 0; i < folds.length; i++) {
        const scroller = scrollers[i];
        let overflowHeight = insideFold.scrollers[0].children[0].clientHeight - centerFold.clientHeight;

        if (scroll == 0) {
          scroller.children[0].style.transform = `translateY(${overflowHeight-1}px)`;
          window.scrollTo(overflowHeight - 1, overflowHeight - 1);
        }
        else if (scroll * -1 >= overflowHeight) {
          scroller.children[0].style.transform = `translateY(1px)`;
          window.scrollTo(1, 1);
        }
        else{
          scroller.children[0].style.transform = `translateY(${scroll}px)`;
        }
      }
    }
  }
  let insideFold;
  const centerFold = folds[Math.floor(folds.length / 2)];
  let tick = () => {
    if (state.disposed) return;
    document.body.style.height = insideFold.scrollers[0].children[0].clientHeight - centerFold.clientHeight + window.innerHeight + 'px';
    state.targetScroll = -(document.documentElement.scrollTop || document.body.scrollTop);
    state.scroll += lerp(state.scroll, state.targetScroll, 1, 1);
    insideFold.updateStyles(state.scroll);
    requestAnimationFrame(tick);
  };
  insideFold = new FoldedDom(wrapper, folds);
  insideFold.setContent(baseContent);
  tick();
}

$(document).ready(function() {

  // ajax
  History.Adapter.bind(window, 'statechange', function() {
    var target = History.getState().hash.split("?")[0].substring(1);

    if (!target.length == 0) {
      ajax(target)
    }
  });

  function push(data) {
    History.pushState(data, document.title, data);
    return false
  }

  function input(){
    $('input').val('');
  }

  function color(){
    var classes = ['color', 'candy', 'black'];
    $('body').attr('class','').addClass(classes[~~(Math.random() * classes.length)]);
  }

  function checkCount(i, posY) {
    if (i == 5) {
      doFold();
      window.scrollTo({left: 1, top: Math.round(posY), behavior: 'auto'});
    }
  }

  $.extend($.scrollTo.defaults, {
    axis: 'y',
    duration: 5
  });

  function ajax(target) {
    $.ajax({
      url: '/' + target,
      type: 'POST',
      success: function(response) {
        $('body').attr('ndx--target-view', target)
        $('.wrap').html(response);
        setTimeout(function () {
          $(window).scrollTo({top: '10px'})
        }, 10);
      }
    });
  };


  $(document).on('click','nav span',function(e){
    if ($('nav ul').hasClass('active')) {
      $('ul').removeClass('active')
    }
    else{
      $('ul').addClass('active')
    }
  })

  $(document).on('click','nav li a',function(e){
    $('nav li a').removeClass('active')
    $(this).addClass('active')
    $('ul').removeClass('active')
  })

  $(document).on('click','a',function(e){
    if ($(this).hasClass('internal')){
      e.preventDefault();
      target = $(this).attr('href')
      // CHANGE
      newtarget = target.replace("http://localhost:8000", "")
      push(newtarget)
    }
    else if ($(this).attr('ndx--target')){
      e.preventDefault();
      target = '/'+$(this).attr('ndx--target')
      push(target)
    }
  })

  function init(){
    input();
    var posY = 1;
    var loc = window.location.toString();
    var target = loc.split("/");
    if (target.length == 4 && target[3] != ''){
      $('#'+target[3]).each(function(){
        posY = $(this).offset().top;
      })
    }

    for (var i = 0; i < 6; i++) {
      $('.wrap').first().clone().appendTo('.fold-content')
      checkCount(i, posY);
    }
    wl = window.location
    $('nav li a[ndx--target="'+wl+'"]').addClass('active')


  }


  function cloneInput() {
    var value = $('.subscribe-form.active input').val();
    if (value.length > 0){
      $('input[type="email"]').each(function(){
        $(this).val(value);
      })
    }
  }


  function submit(e){
    e.preventDefault;

    $('.subscribe-form.active').MailChimpForm({
      url: 'https://jetzt.us10.list-manage.com/subscribe/post?u=5f80021c44ded619d9e5b9f60&id=b75ee49526',
      fields: '0:EMAIL',
      submitSelector: '#submit-formi',
      customMessages: {
        E001: 'Input is empty',
        E002: 'Wrong date',
        E003: 'No @ sign in email',
        E004: 'Invalid email address',
        E005: 'Too many subscribe attempts',
      },
      onOk: (message) => {
        $('.response').each(function(){
          $(this).html(message).css('display','block')
          $('.mc-form-group-EMAIL, .su').css('display','none')
          $('.submit-form').css('display','none')
        })
      },
      onFail: (message) => {
        $('.response').each(function(){
          $(this).html(message).css('display','block')
          $('.mc-form-group-EMAIL, .su').css('display','none')
          $('.submit-form').css('display','none')
        })
      },
    });

    setTimeout(function () {
      $('#submit-formi').trigger('click')
    }, 100);
  }

  init()


  $(document).on('focusin','input[type="email"]',function() {
    $('.subscribe-form').removeClass('active')
    $('.submit-form').removeClass('active')
    $('.wrap').removeClass('active')

    $(this).closest('.subscribe-form').addClass('active')
    $(this).closest('.subscribe-form').next('.submit-form').addClass('active')
    $(this).closest('.wrap').addClass('active')
  });

  $(document).on('focusout','input[type="email"]',function() {
    cloneInput()
  });


  $(document).on('keydown',function(e) {
    e.preventDefault;

    if(e.keyCode == 13 && $('.wrap.active input[type="email"]').is(":focus")){
      var value = $('.subscribe-form.active input[type="email"]').val();
      if (value.length > 0){
        submit(e);
        return false;
      }
    }

  });

  $(document).on('click','.submit-form',function(e){
    e.preventDefault;
    submit(e)
  })

  $(document).on('click','.slider img',function(e){
    slidercount = $(this).closest('.slider').attr('ndx--count');
    slidecount = $(this).attr('ndx--count');
    newcount =  parseInt(slidecount) + 1;
    sliderlength = $(this).closest('.slider').find('img').length;
    if (newcount > sliderlength){
      $('.slider[ndx--count="'+slidercount+'"] .counter').html('1');
      $('.slider[ndx--count="'+slidercount+'"] img[ndx--count="'+slidecount+'"]').removeClass('show')
      $('.slider[ndx--count="'+slidercount+'"] img[ndx--count="1"]').addClass('show')
    }else{
      $('.slider[ndx--count="'+slidercount+'"] .counter').html(newcount);
      $('.slider[ndx--count="'+slidercount+'"] img[ndx--count="'+slidecount+'"]').removeClass('show')
      $('.slider[ndx--count="'+slidercount+'"] img[ndx--count="'+newcount+'"]').addClass('show')
    }
    $('.caption').html($('.slider img.show').attr('ndx--caption'))
    $('.fold').hide().show(0);
  })
});

this.canvas = document.createElement('canvas');
this.canvas.width=32;
this.canvas.height=32;
this.ctx = this.canvas.getContext('2d');
document.body.appendChild(this.canvas);

setInterval(()=>{
      this.counter++;
      let cols = ["red","green","blue","white","black","pink","yellow"];
      this.ctx.fillStyle = cols[Math.floor(cols.length*Math.random())];
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      const favicon = document.getElementById("favicon1");
      favicon.setAttribute("href", this.canvas.toDataURL('image/png'));  
},200);

