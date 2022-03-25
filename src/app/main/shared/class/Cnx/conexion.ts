export class Conexion {

    /*private IP : string = "localhost";
    private PORT : String =  "44311";

    public TimeVerif: number = 600;
    public TimeClose: number = 30;


    Url() : string{
        return "https://"+this.IP+":"+this.PORT+"/api/"; 
    }*/


    private IP : string = "192.168.14.8";
    private PORT : String =  "23501";

    public TimeVerif: number = 600;
    public TimeClose: number = 30;


    Url() : string{
        return "http://"+this.IP+":"+this.PORT+"/api/"; 
    }

    /*private IP : string = "jmartinezapi.azurewebsites.net";
    public TimeVerif: number = 600;
    public TimeClose: number = 30;

    Url() : string{
        return "https://"+this.IP+"/api/"; 
    }*/

}
