(() => {
  // performance tests
  const counts = [5, 50, 500, 5000, 50000];

  function runBenchmark(count, fn) {
    const arr = Array.from(Array(count));

    const start = performance.now();
    fn(arr);
    const end = performance.now();

    return end - start;
  }

  function runBenchmarks(name, fn) {
    return counts.map(count => {
      console.log(`${name} ${count} entries`);
      const duration = runBenchmark(count, fn);

      return {
        name,
        count,
        ['duration (ms)']: parseFloat(Number(duration).toFixed(2))
      };
    });
  }

  const allResults = [
    ...runBenchmarks('{ ...obj, [i]: i + 1 }', arr => {
      arr.reduce((obj, _, i) => {
        return { ...obj, [i]: i + 1 };
      }, {});
    }),

    ...runBenchmarks('Object.assign(obj, { [i]: i + 1 })', arr => {
      arr.reduce((obj, _, i) => {
        Object.assign(obj, { [i]: i + 1 });
        return obj;
      }, {});
    }),

    ...runBenchmarks('obj[i] = i + 1;', arr => {
      arr.reduce((obj, _, i) => {
        obj[i] = i + 1;
        return obj;
      }, {});
    }),

    ...runBenchmarks('[...arr2, ...[i, i + 1]]', arr => {
      arr.reduce((arr2, _, i) => {
        return [...arr2, ...[i, i + 1]];
      }, []);
    }),

    ...runBenchmarks('[].concat(arr2, [i, i + 1])', arr => {
      arr.reduce((arr2, _, i) => {
        return [].concat(arr2, [i, i + 1]);
      }, []);
    }),

    ...runBenchmarks('arr2.push(...[i, i + 1])', arr => {
      arr.reduce((arr2, _, i) => {
        arr2.push(...[i, i + 1]);
        return arr2;
      }, []);
    })
  ];
  console.table(allResults);
})();
