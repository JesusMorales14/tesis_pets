from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator
from ml.predict import predict_sickness

app = FastAPI(title="API Diagnóstico Veterinario")

# --- Clase de síntomas ---
class Sintomas(BaseModel):
    especie: str
    fiebre: int = Field(0, ge=0, le=3)
    espasmos: int = Field(0, ge=0, le=3)
    convulsiones: int = Field(0, ge=0, le=3)
    desorientacion: int = Field(0, ge=0, le=3)
    temblores: int = Field(0, ge=0, le=3)
    tos_seca: int = Field(0, ge=0, le=3)
    jadeo_excesivo: int = Field(0, ge=0, le=3)
    arcadas_frecuentes: int = Field(0, ge=0, le=3)
    dificultad_comer: int = Field(0, ge=0, le=3)
    asfixia_aparente: int = Field(0, ge=0, le=3)
    vomitos: int = Field(0, ge=0, le=3)
    letargo: int = Field(0, ge=0, le=3)
    tos: int = Field(0, ge=0, le=3)
    diarrea: int = Field(0, ge=0, le=3)
    respiracion_rapida: int = Field(0, ge=0, le=3)
    cianosis: int = Field(0, ge=0, le=3)
    nauseas: int = Field(0, ge=0, le=3)
    gases: int = Field(0, ge=0, le=3)
    heces_con_sangre: int = Field(0, ge=0, le=3)
    heces_negras: int = Field(0, ge=0, le=3)
    estreñimiento: int = Field(0, ge=0, le=3)
    encias_palidas: int = Field(0, ge=0, le=3)
    encias_rojas: int = Field(0, ge=0, le=3)
    llenado_capilar_lento: int = Field(0, ge=0, le=3)
    picazon: int = Field(0, ge=0, le=3)
    perdida_pelo: int = Field(0, ge=0, le=3)
    piel_enrojecida: int = Field(0, ge=0, le=3)
    heridas_piel: int = Field(0, ge=0, le=3)
    costras: int = Field(0, ge=0, le=3)
    mal_olor_piel: int = Field(0, ge=0, le=3)
    ojos_llorosos: int = Field(0, ge=0, le=3)
    secrecion_ocular: int = Field(0, ge=0, le=3)
    ojos_rojos: int = Field(0, ge=0, le=3)
    pupilas_dilatadas: int = Field(0, ge=0, le=3)
    dolor_al_moverse: int = Field(0, ge=0, le=3)
    orina_frecuente: int = Field(0, ge=0, le=3)
    dificultad_orinar: int = Field(0, ge=0, le=3)
    sangre_en_orina: int = Field(0, ge=0, le=3)
    orina_oscura: int = Field(0, ge=0, le=3)
    agresividad: int = Field(0, ge=0, le=3)
    ansiedad: int = Field(0, ge=0, le=3)
    aislamiento: int = Field(0, ge=0, le=3)
    confusion: int = Field(0, ge=0, le=3)

    @field_validator("especie")
    def especie_valida(cls, v):
        v_lower = v.lower()
        if v_lower not in ["perro", "gato"]:
            raise ValueError("La especie debe ser 'perro' o 'gato'")
        return v_lower

# --- Endpoints ---
@app.get("/")
def root():
    return {"message": "API de diagnóstico veterinario funcionando"}

@app.post("/predict")
def predict(data: Sintomas):
    input_dict = data.dict()
    try:
        result = predict_sickness(input_dict)
    except ValueError as e:
        # Retorna error 400 en lugar de JSON genérico
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Otros errores inesperados
        raise HTTPException(status_code=500, detail=f"Error inesperado: {str(e)}")
    
    return result