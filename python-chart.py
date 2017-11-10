import datetime
from threading import Thread
import json
import collections
import requests
import sys
import plotly.plotly as py
import plotly.graph_objs as go
import matplotlib.pyplot as plt
import time

def ShowCrashRate():
    res = requests.get("http://localhost:8888/files/output/tdrHistogram.json")
    #print res.text
    obj = json.loads(res.text)
    avg = float(obj['tdrPings']) / float(obj['sessions']['count']);
    totalTDRs = 0
    for result in obj['results']:
        totalTDRs += result;
    avgTDR = float(totalTDRs)  / float(obj['tdrPings'])
    print str(avg) + "/" + str(avgTDR)

def ShowTDRPieChart():
    res = requests.get("http://localhost:8888/files/output/tdr-statistics.json")
    obj = json.loads(res.text)
    #print res.text
    labels = []
    values = []
    print obj['sessions']['share']
    for key in obj['sessions']['share']:
        labels.append(key)
        values.append(obj['sessions']['share'][key])
    plt.pie(values, labels=labels)
    plt.axis('equal')
    plt.show()

def DrawLineGraph(obj, num):
    xAxis = []
    plt.figure(num)
    for key in obj:
        xAxis.append(key)
    for version in obj[obj.keys()[0]]:
        data = []
        for key in obj:
            data.append(obj[key][version])
        plt.plot(xAxis, data, label="Firefox"+str(version))
        plt.legend(bbox_to_anchor=(0., 1.02, 1., .102), loc=3,
                   ncol=5, mode="expand", borderaxespad=0.)
    plt.show()

def SaveJson(data, name):
    with open("json/"+name, 'w+') as fp:
        json.dump(data, fp)

def ShowLineGraph():
    latestVersion = 58
    res = requests.get("http://localhost:8888/files/output/tdrHistogram.json")
    obj = json.loads(res.text)

    dates = {}
    for key in obj['tdr']:
        date = key.split(" ")
        localDict = {}
        for version in obj['total'][key]:
            if int(version) < latestVersion - 5:
                continue
            if version not in obj['tdr'][key]:
                tdrNum = 0
            else:
                tdrNum = float(obj['tdr'][key][version])
            localDict[version] = (tdrNum/float(obj['total'][key][version]))*100
        dates[date[0]] = localDict

    SaveJson(dates, "normalLine.json")
    dates = collections.OrderedDict(sorted(dates.items()))
    for date in dates:
        print str(date)
        dates[date] = collections.OrderedDict(sorted(dates[date].items()))
        for version in dates[date]:
            print version + " : " + str(dates[date][version])
    DrawLineGraph(dates, 1)


def GetCrashNum(date, version):
    urlStr = "https://crash-stats.mozilla.com/api/SuperSearch/?product=Firefox"
    preDate = date - datetime.timedelta(1)
    dateStr = "&date=>" + preDate.strftime("%Y-%m-%d") + "&date=<" + date.strftime("%Y-%m-%d")
    verStr = "&version=" + str(version) + ".0a1&version=" + str(version) + ".0&version=" + str(version) +".0b"

    res = requests.get(urlStr + dateStr + verStr)
    jRes = json.loads(res.text)
    return jRes['total']

def GetTDRNum(date, version):
    urlStr = "https://crash-stats.mozilla.com/api/SuperSearch/?product=Firefox"
    preDate = date - datetime.timedelta(1)
    dateStr = "&date=>" + preDate.strftime("%Y-%m-%d") + "&date=<" + date.strftime("%Y-%m-%d")
    verStr = "&version=" + str(version) + ".0a1&version=" + str(version) + ".0&version=" + str(version) +".0b"
    tdrLogStr = "&graphics_critical_error=~Detected%20device%20reset&graphics_critical_error=~D3D11%20skip%20BeginFrame%20with%20with%20device-removed&graphics_critical_error=~D3D11%20detected%20a%20device%20reset"
    print urlStr + dateStr + verStr + tdrLogStr
    res = requests.get(urlStr + dateStr + verStr + tdrLogStr)
    jRes = json.loads(res.text)
    return jRes['total']

def LoadFiles():
    dates = {}

    with open('result.json', 'r') as fp:
        lines = fp.readlines()
        lineNum = len(lines)
        curLine = 0
        while curLine < lineNum:
            date = lines[curLine]
            date = date.replace('\n','')
            print date
            curLine+=1
            dateNum = int(lines[curLine])
            curLine+=1
            localMap = {}
            for i in range(dateNum):
                localMap[int(lines[curLine])] = float(lines[curLine+1])
                curLine+=2
            dates[date] = localMap
    dates = collections.OrderedDict(sorted(dates.items()))
    print dates
    return dates

def UpdateFiles(dates):
    with open('result.json', 'w') as fp:
        for date in dates:
            fp.write(date + '\n')
            fp.write(str(len(dates[date])) + '\n')
            for version in dates[date]:
                fp.write(str(version) + '\n')
                fp.write(str(dates[date][version]) + '\n')
    fp.close()
    return

def ShowCrashHistogram():
    dates = LoadFiles()
    date = datetime.datetime.now().date()
    latestVersion = 58

    for i in range(1,30):
        date = date - datetime.timedelta(1)
        localDict = {}
        if str(date) in dates:
            continue
        for version in range(latestVersion - 5, latestVersion+1):
            # GetCrashNum in date with version
            # GetTDRNum in date with version
            localDict[version] = (float(GetTDRNum(date, version)) / float(GetCrashNum(date, version))) * 100
            #localDict[version] = GetTDRNum(date, version)
        dates[str(date)] = localDict

    dates = collections.OrderedDict(sorted(dates.items()))
    for date in dates:
        print str(date)
        dates[date] = collections.OrderedDict(sorted(dates[date].items()))
        for version in dates[date]:
            print str(version) + " : " + str(dates[date][version])

    SaveJson(dates, "crashLine.json")
    UpdateFiles(dates)
    DrawLineGraph(dates, 2)

class ShowLine(Thread):
    def __init__(self, val):
        Thread.__init__(self)
        self.val = val

    def run(self):
        ShowLineGraph()

class ShowCrashLine(Thread):
    def __init__(self, val):
        Thread.__init__(self)
        self.val = val

    def run(self):
        ShowCrashHistogram()

def main():
    # show crash rate
    # ShowCrashRate()
    # show pie chart according to version
    # ShowTDRPieChart()
    # show histogram
    #ShowLineGraph()
    thread1 = ShowLine(1)
    thread1.start()
    # show crash histogram
    thread2 = ShowCrashLine(2)
    thread2.start()
    #ShowCrashHistogram()

    thread1.join()
    thread2.join()

if __name__ == "__main__" :
    sys.exit(main())
