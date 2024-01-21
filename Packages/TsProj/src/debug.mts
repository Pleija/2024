import UnityApi = CS.UnityApi;

export const DevDebug = async function () {
    UnityApi.Log({
        say: "hello, world", me: 1, test: {
            you: "love it", val: {
                ok: true
            }
        }
    });
}