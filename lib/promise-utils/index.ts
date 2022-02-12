import Bluebird from 'bluebird';

export async function waitForResults(promises: Array<Bluebird<any>>): Promise<Array<any>> {
    const res = await Bluebird.all(promises.map((p) => p.reflect()));
    const firstRejection = res.find((v) => v.isRejected());

    return firstRejection ? Bluebird.reject(firstRejection.reason()) : res.map((r) => r.value());
}
