function isString(v) {
  return typeof v === 'string' || v instanceof String;
}

export default function (namedItems, mapItemValue, mapNameValue = name => name) {
  return namedItems.reduce(
    (mapObj, item) => {
      let name = isString(item) ? item : item.name;
      name = name.replace(name[0], name[0].toLowerCase());
      mapObj[mapNameValue(name)] = mapItemValue(name, item);
      return mapObj;
    } , {});
};
