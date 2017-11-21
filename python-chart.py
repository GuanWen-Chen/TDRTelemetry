import datetime
import json
import collections
import requests
import sys
import time

urlStr = "https://crash-stats.mozilla.com/api/SuperSearch/?product=Firefox"
tdrLogStr = "&graphics_critical_error=~Detected%20device%20reset&graphics_critical_error=~D3D11%20skip%20BeginFrame%20with%20with%20device-removed&graphics_critical_error=~D3D11%20detected%20a%20device%20reset"
latestVersion = 59

def SaveJson(data, name):
    with open("json/"+name, 'w+') as fp:
        json.dump(data, fp)

def GetCrashNum(date, version):
    preDate = date - datetime.timedelta(1)
    dateStr = "&date=>" + preDate.strftime("%Y-%m-%d") + "&date=<" + date.strftime("%Y-%m-%d")
    verStr = "&version=" + str(version) + ".0a1&version=" + str(version) + ".0&version=" + str(version) +".0b"

    res = requests.get(urlStr + dateStr + verStr)
    jRes = json.loads(res.text)
    return jRes['total']

def GetTDRNum(date, version):
    preDate = date - datetime.timedelta(1)
    dateStr = "&date=>" + preDate.strftime("%Y-%m-%d") + "&date=<" + date.strftime("%Y-%m-%d")
    verStr = "&version=" + str(version) + ".0a1&version=" + str(version) + ".0&version=" + str(version) +".0b"
    print urlStr + dateStr + verStr + tdrLogStr
    res = requests.get(urlStr + dateStr + verStr + tdrLogStr)
    jRes = json.loads(res.text)
    return jRes['total']

def GetTDRSigs(version):
    date = datetime.datetime.now()
    preDate = date - datetime.timedelta(30)
    dateStr = "&date=>" + preDate.strftime("%Y-%m-%d") + "&date=<" + date.strftime("%Y-%m-%d")
    verStr = "&version=" + str(version) + ".0a1&version=" + str(version) + ".0&version=" + str(version) +".0b"
    res = requests.get(urlStr + dateStr + verStr + tdrLogStr)
    jRes = json.loads(res.text)
    return jRes['facets']['signature']

def GetSigNum(version, sig):
    date = datetime.datetime.now()
    preDate = date - datetime.timedelta(30)
    dateStr = "&date=>" + preDate.strftime("%Y-%m-%d") + "&date=<" + date.strftime("%Y-%m-%d")
    verStr = "&version=" + str(version) + ".0a1&version=" + str(version) + ".0&version=" + str(version) +".0b"
    res = requests.get(urlStr + dateStr + verStr + "&signature=~" + sig)
    jRes = json.loads(res.text)
    return jRes['total']

def LoadFiles():
    result = {}
    result = json.load(open('json/crashLine.json', 'r'))
    return result

def ShowCrashHistogram():
    date = datetime.datetime.now().date()
    result = LoadFiles()

    for i in range(1,16):
        date = date - datetime.timedelta(1)
        for version in range(latestVersion - 3, latestVersion+1):
            if str(version) not in result:
                result[str(version)] = {}
            if str(date) in result[str(version)]:
                continue
            crashNum = float(GetCrashNum(date, version))
            if crashNum == 0:
                result[str(version)][str(date)] = 0
            else:
                result[str(version)][str(date)] = (float(GetTDRNum(date, version)) / crashNum) * 100
    SaveJson(result, "crashLine.json")

def FetchCrashReports():
    crashReports = {}
    for version in range(latestVersion - 3, latestVersion+1):
        crashReports[version] = GetTDRSigs(version)
        for sig in crashReports[version]:
            sig['total'] = GetSigNum(version, sig['term'])
    SaveJson(crashReports, "crashReports.json")

def main():
    ShowCrashHistogram()
    FetchCrashReports()
if __name__ == "__main__" :
    sys.exit(main())
