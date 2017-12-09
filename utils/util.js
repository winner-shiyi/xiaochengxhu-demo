export function formatDate(value, format) {
  function fix(dTemp) {
    let d = dTemp;
    d = `${d}`;
    if (d.length <= 1) {
      d = `0${d}`;
    }
    return d;
  }
  const maps = {
    yyyy(d) { return d.getFullYear(); },
    MM(d) { return fix(d.getMonth() + 1); },
    dd(d) { return fix(d.getDate()); },
    HH(d) { return fix(d.getHours()); },
    mm(d) { return fix(d.getMinutes()); },
    ss(d) { return fix(d.getSeconds()); },
  };

  const chunk = new RegExp(Object.keys(maps).join('|'), 'g');

  function formatDateInside(valueTemp, formatTemp) {
    const formatTempvalue = formatTemp || 'yyyy-MM-dd HH:mm:ss';
    const valueTempValue = new Date(valueTemp);
    return formatTempvalue.replace(chunk, (capture) => (maps[capture] ? maps[capture](valueTempValue) : ''));
  }

  return formatDateInside(value, format);
}
export function utilTrim(str) {
  return str.replace(/^(\s|\u00A0)+/, '').replace(/(\s|\u00A0)+$/, '');
}

