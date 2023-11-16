using System;

namespace Hubs;

[Serializable]
public class UserData
{
    public User data;
    public long lastFrame = -1;
    public long timestamp;
}
