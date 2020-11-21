export default class Benchmark {
  static timeRun(func: Function): number {
    const t0 = new Date().getTime();
    func();
    return new Date().getTime() - t0;
  }

  private static warmup() {
    // warmup, cost around 1 sec for 100000000 runs of dummy calculation
    let dummy = 0;
    for (let i = 0; i < 100000000; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      dummy = i * i;
    }
  }

  static compareFunc(
    func1: Function,
    func2: Function,
    runs: number = 1
  ): number {
    Benchmark.warmup();

    let t1 = 0,
      t2 = 0;
    for (let i = 0; i < runs; i++) {
      if (i % 2 === 0) {
        t1 += Benchmark.timeRun(func1);
        t2 += Benchmark.timeRun(func2);
      } else {
        t2 += Benchmark.timeRun(func2);
        t1 += Benchmark.timeRun(func1);
      }
    }

    return t1 / t2; // timeOfFunc1 / timeOfFunc2
    // return t2/t1; // speedOfFunc1 / speedOfFunc2
  }

  static compareFuncAndShow(
    func1: Function,
    func2: Function,
    runs: number = 1
  ): void {
    const timeF1VsF2 = Benchmark.compareFunc(func1, func2, runs);
    const speedF1VsF2 = 1 / timeF1VsF2;

    console.log(
      `In ${runs} runs, the speed of "${func1.name}" is ${speedF1VsF2} times as fast as "${func2.name}".`
    );
  }
}
