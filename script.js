const hsURL = './HS.json';
var hs;
var suffixes;
var sufSelector;

var request = new XMLHttpRequest();
request.open('GET', hsURL);
request.responseType='json';
request.send();
request.onload = function() {
  hs = request.response;
  inBoxing(hs, 'l1');
  equalHeight('l1');
}

function inBoxing(boxes, level, isSufSec) {
  var boxWidth = (1200 / boxes.length - 10).toString() + "px";
  for (let i = 0; i < boxes.length; i++) {
    var box = document.createElement('div');
    box.setAttribute('class', 'box');
    box.style.width = boxWidth;
    box.id = boxes[i].code;
    if (box.id[0] === '5') {
      box.setAttribute('class', 'elec');
    }
    box.addEventListener('click', click);
    var name = document.createElement('h3');
    name.innerHTML = boxes[i].name;
    box.appendChild(name);
    if (Object.keys(boxes[i]).includes('def')) {
      var def = document.createElement('p');
      def.innerHTML = boxes[i].def;
      box.appendChild(def);
    }
    if (Object.keys(boxes[i]).includes('ex')) {
      var ex = document.createElement('p');
      ex.setAttribute('class', 'ex');
      ex.innerHTML = boxes[i].ex;
      box.appendChild(ex);
    }
    var sec = document.getElementById(level);
    sec.appendChild(box);
  }
}

function click(e) {
  var isSufSec = e.target.parentNode.classList.contains('sufSec');
  var thisLevel = Number(e.target.parentNode.id.slice(1, e.target.parentNode.id.length+1));
  var code = e.target.id;
  var name = e.target.children[0].innerHTML;
  if (!e.target.classList.contains('selected')) {
    resultInstrument(code, name);
    selectedBox(e);
  }
  var thisBox;
  if (isSufSec) {
    thisSuf = code.slice(1, code.length+1);
    for (var i = 0; i < thisSuf.length; i++) {
      if (i === 0) {
        thisBox = suffixes[Number(thisSuf[i]) - sufSelector];
      } else {
        thisBox = thisBox.subclasses[Number(thisSuf[i]-1)];
      }
    }
  } else {
    for (var i = 0; i < code.length; i++) {
      if (i === 0) {
        thisBox = hs[Number(code[i]-1)];
      } else {
        thisBox = thisBox.subclasses[Number(code[i]-1)];
      }
    }
  }
  var newLevelLabel = 'l' + (thisLevel + 1);
  removeLowerSections(thisLevel);
  if (thisLevel === 1) {
    suffixes = hs[code[0]-1].suffixes;
    sufSelector = 10 - suffixes.length;
  }
  var lowerLevel;
  if (Object.keys(thisBox).includes('subclasses')) {
    var section = document.createElement('section');
    section.id = newLevelLabel;
    if (isSufSec) {
      section.setAttribute('class', 'sufSec');
    }
    document.querySelector('main').appendChild(section);
    inBoxing(thisBox.subclasses, newLevelLabel);
    equalHeight(newLevelLabel);
  } else if (!isSufSec) {
    var section = document.createElement('section');
    section.id = newLevelLabel;
    document.querySelector('main').appendChild(section);
    section.setAttribute('class', 'sufSec');
    inBoxing(suffixes, newLevelLabel);
    equalHeight(newLevelLabel);
  }
}

function removeLowerSections(level) {
  var sections = document.querySelectorAll("section");
  for (var i = 0; i < sections.length; i++) {
    if (i >= level) {
      sections[i].remove();
    }
  }
}

function resultInstrument(code, name) {
  if (code[0] === '-') {

  } else {
    var lastName;
    document.getElementById('code').innerHTML = prettyCode(code);
    if (name[0] === name[0].toLowerCase()) {
      var tempLevel;
      for (var i = 0; i < code.length; i++) {
        if (i === 0) {
          tempLevel = hs[Number(code[i])-1];
          lastName = tempLevel.name;
        } else {
          tempLevel = tempLevel.subclasses[Number(code[i])-1];
          var tempName = tempLevel.name;
          if (tempName[0] === tempName[0].toLowerCase()) {
            if (Object.keys(tempLevel).includes('replace')) {
              var j = lastName.lastIndexOf(tempName.slice(0, 4));
              lastName = lastName.slice(0, j) + tempName;
            } else {
              lastName += ' ' + tempName;
            }
          } else {
            lastName = tempName;
          }
        }
      }
    } else {
      lastName = name;
    }
    document.getElementById('instrument').innerHTML = " - " + lastName;
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

function selectedBox(e) {
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
