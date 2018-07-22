
export function sortByZh (array) {
  if(!String.prototype.localeCompare) return null;
  array.sort((a, b) => {
    return a.localeCompare(b, 'zh-Hans-CN', {sensitivity: 'accent'})
  })
  return array
}

export function sortUser (array) {
  if(!String.prototype.localeCompare) return null;
  array.sort((a, b) => {
    let nameA = a.nickname
    let nameB = b.nickname
    return nameA.localeCompare(nameB, 'zh-Hans-CN', {sensitivity: 'accent'})
  })
  return array
}

export function groupByZh (friends) {
  // console.log('------groupByZh-------', friends.length)
  // console.time('groupByZh')
  if(!String.prototype.localeCompare) return null;
  let letters = "abcdefghjklmnopqrstwxyz#".split('');
  let zh = "阿八嚓哒妸发旮哈讥咔垃麻拏噢妑七呥扨它穵夕丫帀#".split('');
  let segs = [];
  let curr;
  let teacherArray = []
  let tutorArray = []
  let normalArray = []
  for (let friend of friends) {
    if (friend.role === 'teacher') {
      teacherArray.push(friend)
    } else if (friend.role === 'tutor') {
      tutorArray.push(friend)
    } else {
      normalArray.push(friend)
    }
  }

  curr = {letter: '老师', data: []}
  curr.data = sortUser(teacherArray)
  if (curr.data.length) {
    segs.push(curr)
  }

  curr = {letter: '助教', data: []}
  curr.data = sortUser(tutorArray)
  if (curr.data.length) {
    segs.push(curr)
  }

  letters.forEach((item, i) => {
    curr = {letter: item, data:[]};
    normalArray.forEach((item2, i2) => {
      if (item === '#') {
        if (!isChinese(item2.nickname[0]) && !isChar(item2.nickname[0])) {
          curr.data.push(item2);
        }
      } else if (isChinese(item2.nickname[0]) && (zh[i].localeCompare(item2.nickname, 'zh-Hans-CN', {sensitivity: 'accent'}) <= 0)) {
        if (item2.nickname.localeCompare(zh[i+1], 'zh-Hans-CN', {sensitivity: 'accent'}) === -1) {
          curr.data.push(item2);
        } else if (zh[i+1] === '#') {
          curr.data.push(item2);
        }
      } else if (isChar(item2.nickname[0]) && (letters[i].localeCompare(item2.nickname, 'zh-Hans-CN', {sensitivity: 'accent'}) <= 0) && (item2.nickname.localeCompare(letters[i+1], 'zh-Hans-CN', {sensitivity: 'accent'}) === -1)) {
        curr.data.push(item2);
      }
    });
    if(curr.data.length) {
      segs.push(curr);
      curr.data.sort(function(a, b) {
        return a.nickname.localeCompare(b.nickname, 'zh-Hans-CN', {sensitivity: 'accent'});
      });
    }
  });
  // console.timeEnd('groupByZh')
  return segs;
}

export function isChinese(temp) {
  let reg = /[^\u4E00-\u9FA5]/
  return !reg.test(temp);
}

export function isChar(temp) {
  let reg = /[A-Za-z]/
  return reg.test(temp);
}
