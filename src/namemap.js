function isString(v) {
  return typeof v === 'string' || v instanceof String;
}

export default function (namedItems, mapItem) {
  return namedItems.reduce(
    (mapObj, item) => {
      let name = isString(item) ? item : item.name;
      name = name.replace(name[0], name[0].toLowerCase());
      mapObj[name] = mapItem(name, item);
      return mapObj;
    } , {});
};
