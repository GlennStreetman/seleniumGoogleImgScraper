
import datetime
from werkzeug.exceptions import abort

from flask import Blueprint
from flask import flash
from flask import g
from flask import redirect
from flask import render_template
from flask import request
from flask import url_for
from flaskr.auth import login_required
from flaskr.db import get_db
from flaskr.templates.yardi.yardiSQL import ppoAttribute
from flaskr.templates.yardi.yardiSQL import ppoReport
from flaskr import getb_bp_urls
from flask import jsonify

import glob
from os import path
from os import mkdir
import shutil
import json
import requests
from .imageScrapeGoogle import scrape_Google_Images
from .imageScrapeGoogle import logStatus

bp = Blueprint("pictures", __name__)


def find_unsorted_pics() -> list:  # returns list of jpegs
    unsorted_pics = glob.glob(
        "E:/Flask/pictureApp/pictureApp/static/pictures/**", recursive=True)
    unsorted_pic_list = []
    for i in range(len(unsorted_pics)):
        # for i in range(64):
        if unsorted_pics[i][-4:] == ".jpg":
            correctedFileName = unsorted_pics[i].replace(
                "E:/Flask/pictureApp/pictureApp/", "")
            correctedFileName = correctedFileName.replace("\\", "/")
            filepath = correctedFileName.replace(
                "static/", "")[0:correctedFileName.replace("static/", "").rfind("/")+1]
            unsorted_pic_list.append([i, correctedFileName, filepath])
    return unsorted_pic_list


def find_directory() -> list:  # returns list of jpegs
    unsorted_pics = glob.glob(
        "E:/Flask/pictureApp/pictureApp/static/pictures/**", recursive=True)
    directory_list = []
    for i in range(len(unsorted_pics)):
        if unsorted_pics[i].find(".") == -1:
            correcteddDirectory = unsorted_pics[i].replace(
                "E:/Flask/pictureApp/pictureApp/static/", "")
            correcteddDirectory = correcteddDirectory.replace("\\", "/")
            correcteddDirectory += "/" if correcteddDirectory[-1] != "/" else ""
            directory_list.append([i, correcteddDirectory])

    return directory_list


# validate destination directory is in find_directory list
def validate_directory(testDir: str) -> bool:
    for dir in find_directory():
        if dir[1] == testDir:
            return True
    return False


def validate_source_photo(testPhoto: str) -> bool:
    # print("test photo validation: " + testPhoto)
    for photo in find_unsorted_pics():
        # print(photo[1])
        if testPhoto == photo[1].replace("static/", ""):
            return True
    return False


@bp.route("/pictures")
def pictures():
    return render_template("pictures.html",  pics=find_unsorted_pics(), dirs=find_directory())


@bp.route('/_update_picture', methods=("GET", "POST"))
# flag=0 rename individual, flag=1 move bulk
def update_picture(flag=0, picName=0, picFolder=0):
    if flag == 1:
        newPhotoName = picName[picName.rfind("/")+1: picName.rfind(".")]
        newPhotoPath = picFolder
        imgSource = picName.replace(
            "http://127.0.0.1:5000/static/", "")
        basePath = "E:/Flask/pictureApp/pictureApp/static/"

    elif request.method == "POST":
        # print(request.is_json) #content = request.get_json() # print(content)
        jsonData = request.get_json()
        newPhotoName = jsonData['newPhotoName']
        newPhotoPath = jsonData['newPhotoSource']
        imgSource = jsonData['imgSource'].replace(
            "http://127.0.0.1:5000/static/", "")
        basePath = "E:/Flask/pictureApp/pictureApp/static/"
        # print(newPhotoName)
        # print(newPhotoPath)
        # print(imgSource)
        # begin validation
    if validate_source_photo(imgSource) == False:
        # check that the source picture is in the source picture list.
        # print("_update_picture: Failed destination validate_source_photo")
        if flag == 0:
            return jsonify(error="Invalid Source Photo")
        else:
            return ["error", "Invalid Source Photo"]

    if validate_directory(newPhotoPath) == False:
        # check that the destination path is valid
        # print("_update_picture: failed destination validate_directory")
        if flag == 0:
            return jsonify(error="Invalid Destination path")
        else:
            return ["error", "Invalid Destination path"]

    if newPhotoName.isalnum() != True:
        # check that a alphanumeric filename is given.
        # print("_update_picture: failed newPhotoName")
        if flag == 0:
            return jsonify(error="Please Provide an alpha-numeric photo name")
        # else:
            # return ["error", "Please Provide an alpha-numeric photo name"]

    if path.exists(basePath + newPhotoPath + newPhotoName) == True:
        # check to see if the filename + path does not already exist.
        # print("_update_picture: failed, picture already exists")
        if flag == 0:
            return jsonify(error="Duplicate file name already exists.")
        else:
            return ["error", "Duplicate file name already exists."]

    moveFile = shutil.move(
        basePath + imgSource, basePath + newPhotoPath + "/" + newPhotoName + ".jpg")
    moveFile
    # print(moveFile)  # return new files, path, popup with result of move

    # update picture name and location in website and sidebar.
    # print("picture renamed/moved!")
    if flag == 0:
        return jsonify(error="none", success="File Renamed: " + newPhotoName + " and saved in folder: " + newPhotoPath)
    else:
        return ["none", "File Renamed: " + newPhotoName + " and saved in folder: " + newPhotoPath]


@ bp.route('/_new_folder', methods=("GET", "POST"))
def newFolder():

    if request.method == "POST":
        # print(request.is_json) #content = request.get_json() # print(content)
        jsonData = request.get_json()
        newFolder = jsonData['newFolder']
        newFolderPath = jsonData['newFolderPath']
        basePath = "E:/Flask/pictureApp/pictureApp/static/"

        # print(newFolder)
        # print(newFolderPath)

        if path.exists(basePath + newFolderPath + newFolder) == True:
            # check to see if the filename + path does not already exist.
            # print("_new_folder: failed, folder directory already exists")
            return jsonify(error="Duplicate file path already exists.")

        if validate_directory(newFolderPath) == False:
            # check the the file path specified exists
            # print("_new_folder: failed destination validate_directory")
            return jsonify(error="Invalid folder path")

        if newFolder.isalnum() != True:
            # check that the folder name is valid (limit alpha/numeric)
            # print("_update_picture: failed newPhotoName")
            return jsonify(error="Please Provide an alpha-numeric photo name")

        mkdir(basePath + newFolderPath + newFolder)
        return jsonify(error="none", success="Directory Created: " + basePath + newFolderPath + newFolder)


@ bp.route('/_bulk_Move', methods=("GET", "POST"))
def bulkMovePictures():
    global moveLog
    # Post to start move, GET to live update user on status.
    if request.method == "POST":
        moveLog = []
        jsonData = request.get_json()
        moveFiles = jsonData['selectedPictures']
        MoveDestination = jsonData['newFolderPath']

        for file in moveFiles:
            print(file)
            updatedPic = update_picture(
                1, moveFiles[file], MoveDestination)
            moveLog.append(updatedPic[1])

        # finalLog = moveLog("Complete", 0)

        print("Bulk Move Complete")
        print(moveLog)
        return jsonify(moveLog)
    # return live update log
    if request.method == "GET":
        print("returning partial move log")
        print(moveLog)
        return jsonify(moveLog)


class GoogleScrapeRequestClass:

    def __init__(self, googleScrapeFunction, searchTerm, scrapeCount, saveTo, scrapeRequestName):
        self.googleScrapeFunction = googleScrapeFunction
        self.runLog = {0: "spinning up scrape request"}
        self.searchTerm = searchTerm
        self.scrapeCount = scrapeCount
        self.saveTo = "E:/Flask/pictureApp/pictureApp/static/" + saveTo
        self.scrapeRequestName = scrapeRequestName
        self.picture_log = {0: "Spinning up scrape request"}

    def postRequest(self):
        self.newScrape = self.googleScrapeFunction(
            self.searchTerm, self.saveTo, self.scrapeCount, self.picture_log)
        return self.newScrape

    def getRequest(self):
        return self.picture_log


@ bp.route('/_scrape_Request', methods=("GET", "POST"))
def scrape_Picture_Request():

    if request.method == "POST":
        jsonData = request.get_json()
        newRequestName = jsonData['requestName']

        if jsonData['postType'] == 'Scrape':
            globals()[newRequestName] = GoogleScrapeRequestClass(
                scrape_Google_Images,
                jsonData['imageDescription'],
                int(jsonData['imageCount']),
                jsonData['scrapeDestination'],
                jsonData['imageDescription'])

            return globals()[newRequestName].postRequest()
        else:
            return globals()[newRequestName].getRequest()


# @ bp.route('/_scrape_Request_Status', methods=("GET", "POST"))
# def scrape_Picture_Request_Status():

#     if request.method == "POST":
#         jsonData = request.get_json()
#         scrapeRequestName = jsonData['requestName']
#         print("GET:" + scrapeRequestName)
#         return locals()[scrapeRequestName].getRequest()

# ---------------------------------------------------------------------------------


# @ bp.route('/_scrape_Request', methods=("GET", "POST"))
# def scrape_Picture_Request():

#     global runLog

#     if request.method == "POST":

#         jsonData = request.get_json()
#         runLog = {0: "spinning up scrape request"}  # this doesnt do anything
#         searchTerm = jsonData['imageDescription']
#         scrapeCount = int(jsonData['imageCount'])
#         staticPath = "E:/Flask/pictureApp/pictureApp/static/"
#         saveTo = staticPath + jsonData['scrapeDestination']

#         scrapeRequest = scrape_Google_Images(searchTerm, saveTo, scrapeCount)
#         runLog = scrapeRequest
#         return scrapeRequest

#     if request.method == "GET":
#         return jsonify(logStatus())
