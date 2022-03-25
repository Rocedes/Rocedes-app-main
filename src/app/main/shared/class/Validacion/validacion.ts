import { AbstractControl, FormControl, ValidatorFn, FormGroupDirective, NgForm, FormBuilder } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

import {formatDate} from '@angular/common';



/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
      const isSubmitted = form && form.submitted;
      return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
  }


  export class ReglasValidacion {
    public Id : string = "";
    public Regla : string = "";
    public Condicon : string = "";
    public valor : string = "";
  }

export class Validacion {

    private fb = new FormBuilder;


    private lstReglas : ReglasValidacion[] = [];

    constructor(){}
    


    public ValForm = this.fb.group(
        {

        }
      );
     
      
    public add(id : string, regla : string, condicion :  string, valor : string){
        this.ValForm.addControl(id, new FormControl('', this.Cls_Validaciones(id)))

        const _Regla : ReglasValidacion = new ReglasValidacion();
        _Regla.Id = id;
        _Regla.Regla = regla;
        _Regla.Condicon = condicion;
        _Regla.valor = valor;

        this.lstReglas.push(_Regla)
        
    } 

    
    public Cls_Validaciones(id : string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: string } | null => {

            let retorno = "0";
            let errores = "";
    
     
            this.lstReglas.forEach(element => {

                if(id == element.Id && errores == ""){

                    retorno = element.Regla;

                /* if(isNaN(control.value))
                        {
                            return { InValid: true }
                        }*/
                    
          
                        
                    


                       /* if(String(control.value).length  == 0 && errores == "")
                        {
                            errores = "1";
                        }*/
                        
                        let str_cadena  =  String(control.value);
                        let dtFecha1 !: Date;
                        let dtFecha2 !: Date;
                        let parts : string[];

                        if(str_cadena == undefined || str_cadena == "null")
                        {
                            str_cadena = "";
                        }

                        switch(element.Condicon){

                            case "LEN>":
                                if( !(str_cadena.length >  Number(element.valor)))
                                    errores = "1";
                                
                            break;

                            case "LEN<":
                                if( !(str_cadena.length <  Number(element.valor)))
                                    errores = "1";
                                
                            break;

                            case "LEN>=":
                                if( !(str_cadena.length >=  Number(element.valor)))
                                    errores = "1";
                                
                            break;

                            case "LEN<=":
                                if( !(str_cadena.length <=  Number(element.valor)))
                                    errores = "1";
                                
                            break;

                            case "LEN==":
                                if( !(str_cadena.length ==  Number(element.valor)))
                                    errores = "1";
                                
                            break;








                            case "NUM>":

                                if( !(Number(str_cadena) >  Number(element.valor)))
                                    errores = "1";
                                
                            break;

                            case "NUM<":
                                if( !(Number(str_cadena) <  Number(element.valor)))
                                    errores = "1";
                                
                            break;

                            case "NUM>=":
                                if( !(Number(str_cadena) >=  Number(element.valor)))
                                    errores = "1";
                                
                            break;

                            case "NUM<=":
                                if( !(Number(str_cadena) <=  Number(element.valor)))
                                    errores = "1";
                                
                            break;

                            case "NUM==":
                                if( !(Number(str_cadena) ==  Number(element.valor)))
                                    errores = "1";
                                
                            break;












                            case "DATE":

                                if(str_cadena == "")
                                {
                                    errores = "1";

                                }
                                else
                                {
                                    if(!this.ValidarFecha(str_cadena))
                                    {
                                        errores = "1";
                                    }
                                }
                                
                                

                                break;

                            case "DATE>":
                                
                            str_cadena = formatDate(new Date(str_cadena),'dd/MM/yyyy','en-US');

                            parts = str_cadena.split('/');
                            dtFecha1 = new Date( Number.parseInt(parts[2]) , Number.parseInt(parts[1]), Number.parseInt(parts[0]));

                            parts = element.valor.split('/');
                            dtFecha2 = new Date( Number.parseInt(parts[2]) , Number.parseInt(parts[1]), Number.parseInt(parts[0]));


                                if(!this.ValidarFecha(str_cadena))
                                {
                                
                                    if( dtFecha1 >  dtFecha2)
                                    {
                                
                                        errores = "1";
                                    }
                                }

                            break;
                    
                    
                        }
                    

                }

       
                
            });

            if(errores == ""){
                return  null 
            }

    
            return { Regla: retorno }

        };
    }



    private ValidarFecha(fecha : string) {

        let match !: any;

        match = fecha.match(/^([0-2][0-9]|3[0-1])(\/|-)(0[1-9]|1[0-2])\2(\d{4})$/);
        if (match) {
           return true;
        } else if (match && match[0] == fecha) {
           return true;
        }

        return false;
    } 


    parse(value: any): Date | null {
        if ((typeof value === 'string') && (value.indexOf('/') > -1)) {
          const str = value.split('/');
    
          const year = Number(str[2]);
          const month = Number(str[1]) - 1;
          const date = Number(str[0]);
    
          return new Date(year, month, date);
        } else if((typeof value === 'string') && value === '') {
          return new Date();
        }
        const timestamp = typeof value === 'number' ? value : Date.parse(value);
        return isNaN(timestamp) ? null : new Date(timestamp);
      }


}
