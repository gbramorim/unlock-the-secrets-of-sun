import sys
from flask import Flask
from flask import request as r_f
from flask_cors import CORS, cross_origin
import flask
import requests
from requests.api import get
import requests
import os
import json

app = Flask(__name__)

cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# De Recife
latitude = -8.05428
longitude = -34.8813
end = "20211003"
periodo = "Mensal"
mes_desejado = "05"

url = "https://612db2b8e579e1001791dc8d.mockapi.io/api/v1/users"
get_result = requests.get(url)


# Se 0, teve muita nuvem, se 1 teve um dia com céu limpo
# DADOS DE NO MÁXIMO ATÉ 5 MESES ANTES
@app.route("/ceulimpo")
def PegarDiasComCeuLimpo():
    latitude = r_f.args.get('latitude')
    longitude = r_f.args.get('longitude')
    end = r_f.args.get('end')
    #Vamos adicionar o ano buscando do que foi passado de data AINDA para o parametro
    URLDiasComNuvem = "https://power.larc.nasa.gov/api/temporal/daily/point?parameters=CLRSKY_DAYS&community=RE&longitude={longitude}&latitude={latitude}&format=JSON&start=2020&end={end}"
    api_request_url = URLDiasComNuvem.format(
        longitude=longitude, latitude=latitude, end=end)
    response = requests.get(url=api_request_url, verify=True, timeout=30.00)
    data = response.json()
    dias_e_valores = data['properties']['parameter']['CLRSKY_DAYS']
    valores = dias_e_valores.values()
    lista = []
    for key, valor in dias_e_valores.items():
        if valor == 1.0:
            ano = key[0:4]
            mes = key[4:6]
            dia = key[6:8]
            data_formatada = (dia+"/"+mes+"/"+ano)
            # print(data_formatada)
            lista.append(data_formatada)

    ceulimpo = json.dumps(lista)
    return ceulimpo

    # a_dict.values()
    # print(data)

# Media das irradiacoes maximas ao longo dos anos 1990-2019, assumindo que a placa esteja sempre no ângulo ótimo.
# Não é possível selecionar de qual ano estamos pegando os dados, mas temos um valor estatístico "bom"


@app.route("/precos")
def mediaDaIrradiacaoMaxima():
    latitude = r_f.args.get('latitude')
    longitude = r_f.args.get('longitude')
    URLMediaIrradiacao = "https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=SI_EF_TILTED_SURFACE&community=RE&longitude={longitude}&latitude={latitude}&format=JSON"
    api_request_url = URLMediaIrradiacao.format(
        longitude=longitude, latitude=latitude)
    response = requests.get(url=api_request_url, verify=True, timeout=30.00)
    data = response.json()
    irradiacaoAngMaxMeses = data['properties']['parameter']['SI_EF_TILTED_SURFACE_OPTIMAL']

    reaisPorMes = {}
    # calculo da estimativa de quanto em dinheiro é possível economizar ao longo dos meses
    for (month, irradiation) in irradiacaoAngMaxMeses.items():
        if(month == "JAN"):
            month = 1
        elif(month == "FEB"):
            month = 2
        elif(month == "MAR"):
            month = 3
        elif(month == "APR"):
            month = 4
        elif(month == "MAY"):
            month = 5
        elif(month == "JUN"):
            month = 6
        elif(month == "JUL"):
            month = 7
        elif(month == "AUG"):
            month = 8
        elif(month == "SEP"):
            month = 9
        elif(month == "OCT"):
            month = 10
        elif(month == "NOV"):
            month = 11
        elif(month == "DEC"):
            month = 12
        else:
            continue
        reaisPorMes[month] = "R$" + \
            str(round(((float(irradiation) * 30 * 14)/100), 2))
    # print(reaisPorMes)
    return reaisPorMes


# def DadosIrradiacaoEmPlacasSolares():
#     latitude = r_f.args.get('latitude')
#     longitude = r_f.args.get('longitude')
#     periodo = r_f.args.get('periodo')

#     #URLFonteSolar = "https://power.larc.nasa.gov/api/temporal/hourly/point?parameters=CLRSKY_SFC_SW_DWN&community=RE&longitude={longitude}&latitude={latitude}&format=JSON&start={start}&end={end}"
#     URLFonteSolarMensal = "https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=SI_EF_TILTED_SURFACE&community=RE&longitude={longitude}&latitude={latitude}&format=JSON"
#     api_request_url = URLFonteSolarMensal.format(
#         longitude=longitude, latitude=latitude)
#     response = requests.get(url=api_request_url, verify=True, timeout=30.00)
#     data = response.json()
#     #dias_e_valores = data['properties']['parameter']['ALLSKY_SFC_SW_DIFF']
#     #valores = dias_e_valores.values()
#     # for key, valor in dias_e_valores.items() :
#     #     if valor != -999.0:
#     #         ano = key[0:4]
#     #         mes = key[4:6]
#     #         dia = key[6:]
#     #         print ("{}/{}/{}" .format(dia, mes, ano))
#     print(data)


# Só tem até mês 06 com dados
@app.route('/irradiacaoemceulimpo')
def IrradiacaoEmCeuLimpo():
    latitude = r_f.args.get('latitude')
    longitude = r_f.args.get('longitude')
    end = r_f.args.get('end')
    URLDiasComNuvem = "https://power.larc.nasa.gov/api/temporal/hourly/point?parameters=CLRSKY_SFC_LW_DWN&community=RE&longitude={longitude}&latitude={latitude}&format=JSON&start=20210101&end={end}"
    api_request_url = URLDiasComNuvem.format(
        longitude=longitude, latitude=latitude, end=end)
    response = requests.get(url=api_request_url, verify=True, timeout=30.00)
    data = response.json()
    dias_e_valores = data['properties']['parameter']['CLRSKY_SFC_LW_DWN']
    dicionario = {}
    for key, valor in dias_e_valores.items():
        if valor != -999.0:
            ano = key[0:4]
            mes = key[4:6]
            dia = key[6:8]
            hora = key[8:]
            data_formatada = (dia+"/"+mes+"/"+ano+" "+hora+"h")
            # print(data_formatada)
            dicionario[data_formatada] = valor
    return dicionario


# Só até mês 06 com dados também
@app.route("/disponibilidadesol")
@cross_origin()
def SolDisponivel():
    latitude = r_f.args.get('latitude')
    longitude = r_f.args.get('longitude')
    periodo = r_f.args.get('periodo')
    end = r_f.args.get('end')
    mes_desejado = r_f.args.get('mes_desejado')
    print(latitude, longitude, periodo, end, mes_desejado)

    URLSolDisponivel = "https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DIFF&community=RE&longitude={longitude}&latitude={latitude}&format=JSON&start=20210101&end={end}"
    api_request_url = URLSolDisponivel.format(longitude=longitude, latitude=latitude, end=end)
    response = requests.get(url=api_request_url, verify=True, timeout=30.00)
    data = response.json()
    print(data)
    dias_e_valores = data['properties']['parameter']['ALLSKY_SFC_SW_DIFF']
    valores = dias_e_valores.values()
    dicionario = {}
    for key, valor in dias_e_valores.items():
        if valor != -999.0:
            ano = key[0:4]
            mes = key[4:6]
            dia = key[6:]
            data_formatada = (dia+"/"+mes+"/"+ano)
            # print(data_formatada)
            dicionario[data_formatada] = valor
    #Dados da última semana
    if(periodo == "semanal"):
        dados_semanais = {}
        keys = []
        tamanho_dicionario = len(dicionario)
        for key in list(dicionario)[(tamanho_dicionario-7):tamanho_dicionario]:
            keys.append(key)
        for k in keys:
            dados_semanais[k]=dicionario[k]
        return dados_semanais
    elif(periodo == "mensal"):
        dados_mensais = {}
        for key, value in dicionario.items():
            mes = key[3:5]
            if(mes_desejado == mes):
                dados_mensais[key] = value
        print(dados_mensais)
        return dados_mensais
    else:
        return dicionario


@app.route("/usuarios")
def pegar_usuarios():
    get_json = get_result.json()
    main_user = []

    # http://127.0.0.1:5000/usuarios?nome=Denise%20Davis for tests
    user = flask.request.args.get("nome")

    for i in get_json:
        if i['name'] == user:
            main_user.append(user)
        # else:
        #     main_user.append("Não!")

    return str(main_user)


# def main():
    #mediaDaIrradiacaoMaxima(-8.05428, -34.8813)
    # IrradiacaoEmCeuLimpo()
    # PegarDiasComCeuLimpo()
    # SolDisponivel()


# if __name__ == "__main__":
#     main()

# @app.route("/criado")
# def pegar_datas_criacao():
#     get_json = get_result.json()
#     # h = get_json[1]
#     n

#     for i in get_json:
#         created.append(i['createdAt'])

#     return str(created)
