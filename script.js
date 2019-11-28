const hsURL = './HS.json';
var hs;
var suffixes;
var sufSelector;
var branches;
var shift = 30;

var request = new XMLHttpRequest();
request.open('GET', hsURL);
request.responseType='json';
request.send();
request.onload = function() {
  hs = request.response;
  treeBoxes(hs, 'l1');
  equalHeight('l1');
}

function click(e) {
  if (e.target.classList.contains('suffix')) {
    if (e.target.id.length === 2) {
      selectedSuf(e);
    } else {
      selectedSubSuf(e);
    }
  } else {
    selectedBox(e);
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
  subTree(e);
}

function selectedSuf(e) {
  if (e.target.classList.contains('selected')) {
    e.target.classList.remove('selected');
    document.getElementById('c'+e.target.id).remove();
    document.getElementById('n'+e.target.id).remove();
    var subSuf = e.target.parentNode.children;
    for (var i = subSuf.length-1; i >= 0; i--) {
      if (!subSuf[i].classList.contains('box')) {
        document.getElementById(subSuf[i].id).remove();
      }
    }
  } else {
    e.target.classList.add('selected');
    var codeSufSpan = document.createElement('span');
    codeSufSpan.id = 'c'+e.target.id;
    var codeSuf = document.getElementById('codeSuf');
    codeSuf.appendChild(codeSufSpan);
    var nameSufSpan = document.createElement('span');
    nameSufSpan.id = 'n'+e.target.id;
    var instSuf = document.getElementById('instSuf');
    instSuf.appendChild(nameSufSpan);
    subSuffixes(e);
  }
}

function selectedSubSuf(e) {
  var divId = e.target.parentNode.id;
  var brothers = e.target.parentNode.parentNode.children;
  for (var i = 1; i < brothers.length; i++) {
    if (brothers[i].id === divId) {
      brothers[i].children[0].classList.add('selected');
      brothers[i].children[0].classList.remove('discarded');
    } else {
      brothers[i].children[0].classList.remove('selected');
      brothers[i].children[0].classList.add('discarded');
      for (var j = brothers[i].children.length-1; j > 0 ; j--) {
        brothers[i].children[j];
        document.getElementById(brothers[i].children[j].id).remove();
      }
    }
  }
  subSuffixes(e);
}

function subTree(e) {
  var thisLevel = Number(e.target.parentNode.id.slice(1, e.target.parentNode.id.length+1));
  removeLowerBranches(thisLevel);
  var code = e.target.id;
  if (thisLevel === 1) {
    document.getElementById('codeSuf').innerHTML = '';
    document.getElementById('instSuf').innerHTML = '';
    suffixes = hs[Number(code[0])-1].suffixes;
    sufSelector = 10 - suffixes.length;
    sufBoxes();
  }
  var name = e.target.children[0].innerHTML;
  resultInstrument(code, name);
  var thisBox;
  for (var i = 0; i < code.length; i++) {
    if (i === 0) {
      thisBox = hs[Number(code[i])-1];
    } else {
      thisBox = thisBox.subclasses[Number(code[i])-1];
    }
  }
  var newLevelLabel = 'l' + (thisLevel + 1);
  var lowerLevel;
  if (Object.keys(thisBox).includes('subclasses')) {
    var branch = document.createElement('div');
    branch.id = newLevelLabel;
    document.getElementById('tree').appendChild(branch);
    treeBoxes(thisBox.subclasses, newLevelLabel);
    equalHeight(newLevelLabel);
  }
}

function subSuffixes(e) {
  var sufDiv = e.target.parentNode;
  var sufDivCode = sufDiv.id.slice(1, sufDiv.id.length);
  var thisSuf;
  var suffix;
  var nameSufSpan;
  for (var i = 0; i < sufDivCode.length; i++) {
    if (i === 0) {
      thisSuf = suffixes[Number(sufDivCode[i])-1];
      suffix = ', ' + thisSuf.name;
      nameSufSpan = document.getElementById('n'+thisSuf.code);
    } else {
      thisSuf = thisSuf.subclasses[Number(sufDivCode[i])-1];
      if (Object.keys(thisSuf).includes('replace')) {
        suffix = suffix.replace(thisSuf.replace, thisSuf.name);
      } else {
        suffix += ' ' + thisSuf.name;
      }
    }
  }
  nameSufSpan.innerHTML = suffix;
  if (Object.keys(thisSuf).includes('subclasses')) {
    var subclasses = thisSuf.subclasses;
    for (var i = 0; i < subclasses.length; i++) {
      var subSufDiv = document.createElement('div');
      subSufDiv.id = sufDiv.id + (i + 1).toString();
      var boxWidth = (e.target.offsetWidth - shift).toString() + 'px';
      var box = createBox(subclasses[i], boxWidth, true);
      if (e.target.id.length > 1) {
        box.style.position = 'relative';
        box.style.left = (shift * (e.target.id.length-1)).toString() + 'px';
      }
      subSufDiv.appendChild(box);
      sufDiv.appendChild(subSufDiv);
    }
  }
  document.getElementById('c'+thisSuf.code.slice(0, 2)).innerHTML = thisSuf.code;
}

function removeLowerBranches(level) {
  branches = document.getElementById("tree").children;
  for (var i = branches.length-1; i >= 0; i--) {
    if (i >= level) {
      branches[i].parentNode.removeChild(branches[i]);
    }
  }
}

function treeBoxes(boxes, level) {
  var boxWidth = (1200 / boxes.length - 10).toString() + "px";
  for (let i = 0; i < boxes.length; i++) {
    var box = createBox(boxes[i], boxWidth, false);
    var branch = document.getElementById(level);
    branch.appendChild(box);
  }
}

function resultInstrument(code, name) {
  if (code[0] === '-') {
    document.getElementById('codeSuf').innerHTML += code;
    document.getElementById('instSuf').innerHTML += name;
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
              lastName = lastName.replace(tempLevel.replace, name);
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

function sufCodeName (code, name, replace) {
  var codeSuf = document.getElementById('c'+code.slice(0, 2));
  var instSuf = document.getElementById('n'+code.slice(0, 2));
  codeSuf.innerHTML = code;
  if (replace === null) {
    instSuf.innerHTML = instSuf.innerHTML + name;
  }
}

function removeSuffix (code, name) {
  document.getElementById('codeSuf').innerHTML = document.getElementById('codeSuf').innerHTML.replace(code, '');
  document.getElementById('instSuf').innerHTML = document.getElementById('instSuf').innerHTML.replace(name, '');
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

function sufBoxes() {
  var boxWidth = (1200 / suffixes.length - 10).toString() + "px";
  var sufSec = document.getElementById('suffixes');
  var sufSecChildren = sufSec.childNodes;
  for (var i = sufSecChildren.length-1; i >= 0; i--) {
    sufSec.removeChild(sufSecChildren[i]);
  }
  for (var i = 0; i < suffixes.length; i++) {
    var sufDiv = document.createElement('div');
    sufDiv.setAttribute('class', 'suffixDiv');
    sufDiv.id = 's' + (i + 1).toString();
    var box = createBox(suffixes[i], boxWidth, true)
    // box.style.marginBottom = '2px';
    sufDiv.appendChild(box);
    sufSec.appendChild(sufDiv);
  }
  var maxHeight = 0;
  var sufSecChildren = sufSec.childNodes;
  for (var i = 0; i < sufSecChildren.length; i++) {
    var thisHeight = sufSecChildren[i].firstChild.offsetHeight
    if (thisHeight > maxHeight) {maxHeight = thisHeight;}
  }
  for (var i = 0; i < sufSecChildren.length; i++) {
    sufSecChildren[i].firstChild.style.height = maxHeight.toString() + "px";
  }
}

function createBox(thisBox, boxWidth, isSuf) {
  var box = document.createElement('div');
  box.setAttribute('class', 'box');
  box.style.width = boxWidth;
  box.id = thisBox.code;
  if (isSuf) {
    box.classList.add('suffix');
  }
  if (box.id[0] === '5') {
    box.classList.add('elec');
  }
  box.addEventListener('click', click);
  var name = document.createElement('h3');
  name.innerHTML = thisBox.name;
  box.appendChild(name);
  if (Object.keys(thisBox).includes('def')) {
    var def = document.createElement('p');
    def.innerHTML = thisBox.def;
    box.appendChild(def);
  }
  if (Object.keys(thisBox).includes('ex')) {
    var ex = document.createElement('p');
    ex.setAttribute('class', 'ex');
    ex.innerHTML = thisBox.ex;
    box.appendChild(ex);
  }
  return box;
}
