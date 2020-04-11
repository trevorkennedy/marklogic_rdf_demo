'use strict';

module.exports.makeEdges = function(array) {
  let moduleName = 'vizFunctions makeEdges ';
  let edgesArray = [];
  let resultsPointer = 0;
  for(let node of array) {
    let workingJson = node;
    if(workingJson.connectsTo != 0) {
      let shortenLabel = shortLabel(workingJson.pre);
      if(workingJson.connectsTo == 0 || workingJson.connectsTo == undefined) {
        edgesArray[edgesArray.length] = '{"from": ' + workingJson.objectID + ', "to": ' + workingJson.objectID + ', "label": "' + shortenLabel + '", "font": {"align": "center"}}';
      } else {
        edgesArray[edgesArray.length] = '{"from": ' + workingJson.objectID + ', "to": ' + workingJson.connectsTo + ', "label": "' + shortenLabel + '", "font": {"align": "center"}}';
      };
    };
  };
  return edgesArray.toString()
};

function bubbleSortWords(array){
  let moduleName = 'vizFunctions bubbleSortWords ';
   var len = array.length;
   for (var index = len-1; index>=0; index--){
     for(var jndex = 1; jndex<=index; jndex++){
       if(array[jndex-1]>array[jndex]){
           var temp = array[jndex-1];
           array[jndex-1] = array[jndex];
           array[jndex] = temp;
        };
     };
   };
   return array;
};

function deDupAssignIndex(array) {
  let moduleName = 'vizFunctions deDupAssignIndex ';
  let objectID = 1;
  let returnArray = []
  for(let index=0;index<array.length;index++) {
    if(index < (array.length - 1)) {
      if(array[index].toString() != array[index + 1].toString()) {
        returnArray[returnArray.length] = '{"label": "' + array[index] + '", "order": ' + objectID + '}';
        objectID++;
      };
    } else if(returnArray[returnArray.length - 1] != array[array.length - 1]) {
      returnArray[returnArray.length] = '{"label": "' + array[array.length - 1] + '", "order": ' + objectID + '}';
    };
  };
  return '[' + returnArray + ']';
};

module.exports.unConstituteResults = function(data) {
  let moduleName = 'vizFunction unConstituteResults ';
  let array = [];
  for(let index=0;index<data.length;index++) {
    array[array.length] = data[index].sub;
  };
  for(let index=0;index<data.length;index++) {
    array[array.length] = data[index].obj;
  };
  return deDupAssignIndex(bubbleSortWords(array));
};

module.exports.reConstituteResults = function(unConstitutedResults, original) {
  let moduleName = 'vizFunctions reConstituteResults ';
  let array = [];
  unConstitutedResults = fn.head(xdmp.unquote(xdmp.quote(unConstitutedResults))).root;
  let cnt = 0;
  for(let node of original) {
    array[cnt] = node;
    cnt++;
  };
  for(let index=0;index<array.length;index++) {                         // set object ids to nodes
    let found = false;
    let working = true;
    let cnt = 0;
    while(working) {
      if(array[index].sub.toString() == unConstitutedResults[cnt].label.toString()) {
        array[index].objectID = unConstitutedResults[cnt].order;
        working = false;
        found = true;
      };
      if(cnt >= array.length) {
        working = false;
      };
      cnt++;
    };
    if(!found) {
      array[index].objectID = 0;
    };
  };
  for(let index=0;index<array.length;index++) {                         // set connectsTo options
    let working = true;
    let cnt = 0;
    while(working) {
      if(array[index].obj.toString() == unConstitutedResults[cnt].label.toString()) {
        array[index].connectsTo = unConstitutedResults[cnt].order;
        working = false;
      };
      if(cnt >= array.length) {
        working = false;
      };
      cnt++;
    };
  };
  for(let index=0;index<unConstitutedResults.length;index++) {          // set object ids to nodes
    let found = false;
    let cnt = 0;
    let indexFound = 0;
    for(let jndex=0;jndex<array.length;jndex++) {
      if(array[jndex].objectID.toString() === unConstitutedResults[index].order.toString()) {
        found = true;
        jndex = array.length;
      } else {
        indexFound = index;
      };
    };
    if(!found) {
      let arrayPointer = array.length;
      array[arrayPointer] = {'obj': unConstitutedResults[indexFound].label};
      array[arrayPointer].sub = unConstitutedResults[indexFound].label;
      array[arrayPointer].objectID = unConstitutedResults[indexFound].order;
      array[arrayPointer].connectsTo = 0;
    };
  };
  return array
};
/*
module.exports.findEdges = function(data) {
  let moduleName = 'vizFunctions findEdges ';

  let triplesOrdered = [];
  for(let node of data) {
    triplesOrdered[triplesOrdered.length] = node;
  };
  triplesOrdered = assignObjectNumbers(triplesOrdered);

  let subPointer = 1;                                                     //working on edges and linking to appropriate node set - thinking is to add each sub/obj and then link them. 
  let objPointer = 1;
  let subCurrent = xdmp.toJSON(triplesOrdered[0]).root.sub;
  let preCurrent = xdmp.toJSON(triplesOrdered[0]).root.pre;
  let objCurrent = xdmp.toJSON(triplesOrdered[0]).root.obj;

  triplesOrdered[0].orderObj = objPointer;
  for(i=1;i<triplesOrdered.length;i++) {
    if(i<triplesOrdered.length) {
      if(xdmp.quote(subCurrent) != xdmp.quote(xdmp.toJSON(triplesOrdered[i]).root.sub) && xdmp.quote(objCurrent) != xdmp.quote(xdmp.toJSON(triplesOrdered[i]).root.obj)) {    // both the subject and object have changed
        objPointer++;
        triplesOrdered[i].orderObj = objPointer;
        subCurrent = xdmp.toJSON(triplesOrdered[i]).root.sub;
        preCurrent = xdmp.toJSON(triplesOrdered[i]).root.pre;
        objCurrent = xdmp.toJSON(triplesOrdered[i]).root.obj;
      } else if(xdmp.quote(subCurrent) != xdmp.quote(xdmp.toJSON(triplesOrdered[i]).root.sub)) {
        subCurrent = xdmp.toJSON(triplesOrdered[i]).root.sub;
      } else if(xdmp.quote(objCurrent) != xdmp.quote(xdmp.toJSON(triplesOrdered[i]).root.obj)) {                                    // only the object has changed
        objPointer++; 
        triplesOrdered[i].orderObj = objPointer;
        objCurrent = xdmp.toJSON(triplesOrdered[i]).root.obj;
      };
    } else {
      triplesOrdered[i].objectID = subPointer;
      triplesOrdered[i].orderObj = objPointer;
    };
  };
  return triplesOrdered
}; */

module.exports.makeNodes = function(data) {
  let moduleName = 'vizFunctions makeNodes ';
  let array = [];
  let shape = '';
  array = data;
  array = fn.head(xdmp.unquote(xdmp.quote(xdmp.toJSON(array)))).root;
  let nodesArray = [];
  for(let index=0;index<array.length;index++) {
    let workingJson = array[index];
    let tmpLabel = shortLabel(workingJson.label);
//    nodesArray[nodesArray.length] = '{"id": ' + workingJson.order + ', "label": "' + workingJson.label + '"}';
    nodesArray[nodesArray.length] = '{"id": ' + workingJson.order + ', "label": "' + tmpLabel + '"}';
  };
  return nodesArray.toString()
};

function removeFunctions(inObj) {
  delete inObj.nodeKind;
  delete inObj.nodeType;
  delete inObj.baseURI;
  delete inObj.xpath;
  delete inObj.toString;
  delete inObj.valueOf;
  delete inObj.toObject;
  delete inObj.toJSON;
  delete inObj.length;
  return inObj
};

function shortLabel(iri) {
  let moduleName = 'vizFunctions shortLabel ';
  let tmpLabel = iri;
  while(fn.contains(tmpLabel,'/')) {
    tmpLabel = fn.substringAfter(tmpLabel,'/');
  };
  return tmpLabel
};

function arrayPush(inArr,addElement) {
  let returnArray = [];
  for(let i in inArr) {
    returnArray[i] = inArr[i];
  };
  returnArray[returnArray.length] = addElement;
  return returnArray
};

function clone(inObj) {
  let moduleName = 'vizFunctions clone';
  let outObj = {};
  for(let prop in inObj) {
    (inObj[prop].nodeType == 18 || inObj[prop] == 17) ? outObj[prop] = removeFunctions(clone(inObj[prop])) :
    outObj[prop] = inObj[prop];
  };
  return removeFunctions(outObj)
};

module.exports.orderBys = function(dataArray) {
    let moduleName = 'vizFunctions orderBys ';
    dataArray = fn.tokenize(dataArray,',').toArray();
    let orderBy = 'ORDER BY ';
    for(let i in dataArray) {
        orderBy = orderBy + '?' + dataArray[i] + ' ';
    };
    return orderBy
};

   	
