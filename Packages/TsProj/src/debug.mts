import UnityApi = CS.UnityApi;

export const DevDebug = async function () {
    UnityApi.Log({say: "hello, world", me: 123});
}