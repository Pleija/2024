using UnityEngine.Networking;

public class AcceptANGCertificate  : CertificateHandler
{
    protected override bool ValidateCertificate(byte[] certificateData)
    {
        return true;
        // X509Certificate2 certificate = new X509Certificate2(certificateData);
        // string pk = certificate.GetPublicKeyString();
        // //Uncomment to find public key.
        // //Debug.Log(pk);
        // if (pk.ToLower().Equals(PUB_KEY.ToLower()))
        //     return true;
        // return false;
    }   
}