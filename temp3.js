import Gun from "gun";// gun stores null, not undefined. Can not store object if a string or null is already stored on a node, it fails silently. gun does not have event loop, thus it may ignore crud operations if busy. gun can not save arrays, so use the listed functions below to save/retrieve arrays, ".put(array2object(document))", and "Object.keys(resp.arraylist).map((key) => resp.arraylist[key])".
import "gun/lib/load.js";//load returns the full hierarchy, not just first depth which is the default.

let gun = Gun();

const getIndexedObjectFromArray = (arr) => {
  return arr.reduce((acc, item) => {
    return {
      ...acc,
      [item.id]: item,
    }
  }, {});
};

const getArrayFromIndexedObject = (indexedObj) => {
  return Object.values(indexedObj);
};

const animals = [{
    a: [{ id: '1', name: 'Dog'}, { id: '2', name: 'Cat'}],
    b: [{ id: '1', name: 'Dog'}, { id: '2', name: 'Cat'}]
    
}];

const indexedAnimals = getIndexedObjectFromArray(animals);
gun.get('animals').put(indexedAnimals);

gun.get('animals').load((data) => {
  delete data._;
  const normalAnimals = getArrayFromIndexedObject(data);
  console.log(normalAnimals);
  /*
  [
    {
        "id": "1",
        "name": "Dog"
    },
    {
        "id": "2",
        "name": "Cat"
    }
  ]
  */
});