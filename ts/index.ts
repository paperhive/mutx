/*
 * const mutex = new Mutex();
 * const unlock = await mutex.lock();
 * ...
 * unlock();
 */
export class Mutex {
  queue: Array<Promise<any>>;

  constructor() {
    this.queue = [];
  }

  async lock() {
    const mutex = this;

    // copy current locks array
    const queue = mutex.queue.slice();

    // we need the resolve function outside the promise body
    // (in fact we'd need a deferred but that's not the es6 way...)
    let resolve;
    const promise = new Promise(_resolve => resolve = _resolve);

    // enqueue
    mutex.queue.push(promise);

    // wait for all locks (except this one)
    await Promise.all(queue);

    // checks if this promise is the first in line
    function assertState() {
      if (mutex.queue[0] !== promise) {
        throw new Error('Inconsistent Mutex state. Is every call to lock() followed by exactly one call to the corresponding unlock()?');
      }
    }
    assertState();

    // return unlock function
    return () => {
      assertState();

      // remove lock promise
      mutex.queue.shift();

      // resolve lock promise
      resolve();
    };
  }
}
