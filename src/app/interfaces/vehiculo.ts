export interface Vehiculo {
    uid: string;        //* UID del vehículo generado por Firebase
    usuarioUID: string; //* UID del usuario al que pertenece el vehículo
    marca: string;
    modelo: string;
    matricula: string;
    color: string;     //* Opcional
}
