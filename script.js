var x;
const hsURL = './HS.json';
var hs;
var request = new XMLHttpRequest();
request.open('GET', hsURL);
request.responseType='json';
request.send();
request.onload = function() {
  hs = request.response;
  inBoxing(hs, 'l1');
  equalHeight('l1');
}

function inBoxing(list, level) {
  var boxWidth = (1200 / list.length - 10).toString() + "px";
  for (let i = 0; i < list.length; i++) {
    var box = document.createElement('div');
    box.setAttribute('class', 'box');
    box.style.width = boxWidth;
    box.id = list[i].code;
    box.addEventListener('click', click);
    var name = document.createElement('h3');
    name.innerHTML = list[i].name;
    box.appendChild(name);
    if (Object.keys(list[i]).includes('def')) {
      var def = document.createElement('p');
      def.innerHTML = list[i].def;
      box.appendChild(def);
    }
    if (Object.keys(list[i]).includes('ex')) {
      var ex = document.createElement('p');
      ex.setAttribute('class', 'ex');
      ex.innerHTML = list[i].ex;
      box.appendChild(ex);
    }
    var sec = document.getElementById(level);
    sec.appendChild(box);
  }
}

function click(e) {
  selected(e);
  var code = e.target.id;
  document.getElementById('code').innerHTML = prettyCode(code);
  document.getElementById('instrument').innerHTML = "- " + e.target.children[0].innerHTML;
  var l = Number(code.length) + 1;
  checkSection(l);
  var subclasses;
  for (var i = 0; i < code.length; i++) {
    j = Number(code[i]);
    if (i === 0) {
      subclasses = hs[code[i]-1];
    } else {
      subclasses = subclasses.subclasses[code[i]-1];
    }
  }
  if (Object.keys(subclasses).includes('subclasses')) {
    var sec = document.createElement('section');
    sec.id = 'l'+l;
    document.querySelector('main').appendChild(sec);
    inBoxing(subclasses.subclasses, 'l'+l);
    sec.focus();
  }
  equalHeight('l'+l);
}

function checkSection(l) {
  var sections = document.querySelectorAll("section");
  var currentL = Number(sections[sections.length-1].id[1]);
  for (var i = 0; i < sections.length; i++) {
    if (Number(sections[i].id[1]) >= l) {
      sections[i].remove();
    }
  }
}

function prettyCode(code) {
  if (code.length > 6) {
    return code.slice(0, 3) + '.' + code.slice(3, 6) + '.' + code.slice(6);
  } else if (code.length > 3) {
    return code.slice(0, 3) + '.' + code.slice(3);
  } else {
    return code;
  }
}

function selected(e) {
  var id = e.target.id;
  var brothers = e.target.parentNode.children;
  for (i = 0; i < brothers.length; i++) {
    if (brothers[i].id === id) {
      brothers[i].classList.add('selected');
      brothers[i].classList.remove('discarded');
    } else {
      brothers[i].classList.remove('selected');
      brothers[i].classList.add('discarded');
    }
  }
}

function equalHeight(level) {
  var sec = document.getElementById(level);
  var maxHeight = 0;
  var secChildren = sec.children;
  for (var i = 0; i < secChildren.length; i++) {
    if (secChildren[i].offsetHeight > maxHeight) {maxHeight = secChildren[i].offsetHeight;}
  }
  for (var i = 0; i < secChildren.length; i++) {
    secChildren[i].style.height = maxHeight.toString() + "px";
  }
}
