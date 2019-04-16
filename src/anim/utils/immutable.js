// IMMUTABLE MAP
export const imap = {
  set: (map, key, value) => ({
    ...map,
    [key]: value
  }),
  remove: (map, key) => {
    const next = { ...map };
    delete next[key];
    return next;
  }
}

// IMMUTABLE ARRAY
export const iarray = {
  insert: (array, index, value) => ([
    ...array.slice(0, index),
    value,
    ...array.slice(index),
  ]),
  push: (array, value) => ([
    ...array,
    value
  ]),
  set: (array, index, value) => ([
    ...array.slice(0, index),
    value,
    ...array.slice(index + 1)
  ]),
  pop: (array) => array.slice(0, array.length - 1),
  remove: (array, index) => ([
    ...array.slice(0, index),
    ...array.slice(index + 1)
  ])
}
