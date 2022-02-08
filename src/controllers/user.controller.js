const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');

const {sql} = require('../database/sql')
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[a-zA-Z]).{8,20}$/;

//Check email availability controller
const checkEmailAvailability = async (req,res) => {
    const {email} = req.body;
    if(!email || !validator.isEmail(email)) {
        return res.status(400).send({message: "Invalid Email"})
    }
    try {
        const request = new sql.Request();
        request.input('Email',sql.VarChar,email);
        request.output('EmailAvailable',sql.Bit);
        request.execute('SP_CheckEmailAvailability', (err,result) => {
            if(err) {
                return res.status(400).send({message:err});
            }
            if(!result.output.EmailAvailable) {
                return res.status(400).send({message: "המייל הזה כבר קיים אצלנו. כדאי לנסות להתחבר"})
            } 
            return res.status(200).send({message: "Email Available"});
        })
    } catch (err) {
        res.status(500).send({message: "קיימת תקלה זמנית בשרתים שלנו, אנא נסו שוב מאוחר יותר"});
    }
}
//Register user controller
const registerUser = async (req,res) => {
    //Define user
    const user = {
        Email: req.body.email,
        Password: req.body.password,
        Name: req.body.name,
        Surname: req.body.surname,
        Cellphone: req.body.cellphone,
        OnMailingList: req.body.onMailingList,
    }
    //Run user validation
    if(Object.values(user).some(val=>val === undefined)) {
        return res.status(400).send({message:"Invalid Input"});
    }
    if(!validator.isEmail(user.Email)) {
        return res.status(400).send({message:"Invalid Email"});
    }
    if(!passwordRegex.test(user.Password)) {
        return res.status(400).send({message:"Invalid Password"});
    }
    try {
        //Hash password
        const password = await bcryptjs.hash(user.Password,8)
        //Save user to database
        const request = new sql.Request();
        request.query(
            `Insert Into dbo.tbl_Yad2_users (Email, Password, Name, Surname, Cellphone, OnMailingList)
            Values ('${user.Email}','${password}','${user.Name}','${user.Surname}','${user.Cellphone}',${user.OnMailingList?1:0})
            Select Id = IDENT_CURRENT('tbl_Yad2_users')`, (error,result) => {
            if(error) {
                console.log(error);
                res.status(400).send({message:error});
            } else {
                console.log(result)
                const token = jwt.sign({data: result.recordset[0].Id},process.env.SECRET);
                request.query(`INSERT INTO tbl_Yad2_tokens (Token) VALUES ('${token}')`, (err,result)=> {
                    if(err) {
                        console.log(err);
                        throw new Error();
                    } else {
                        res.cookie('AuthToken',token);
                        res.status(200).send({
                            message: 'Registered!'
                        });
                    }
                })
            }
        })  
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error")
    }
}
//User login controller
const userLogin = async (req,res) => {
    const {email,password} = req.body;
    try {
        const request = new sql.Request();
        request.query(`SELECT * FROM tbl_Yad2_users WHERE Email = '${email}'`, (err,result) => {
            if(err) {
                console.log(err);
                throw new Error();
            } else {
                //If no user found or password is incorrect
                if(!result.recordset[0].Id || !bcryptjs.compareSync(password,result.recordset[0].Password)) {
                    return res.status(400).send("אחד הפריטים שהוזנו אינו נכון");
                }
                //create token and return data
                const token = jwt.sign({data: result.recordset[0].Id},process.env.SECRET);
                const {Name,Surname} = result.recordset[0];
                request.query(`INSERT INTO tbl_Yad2_tokens (Token) VALUES ('${token}')`, (err,result)=> {
                    if(err) {
                        console.log(err);
                        throw new Error();
                    } else {
                        res.cookie('AuthToken',token);
                        res.status(200).send({
                            name: Name,
                            surname: Surname,
                        });
                    }
                })
            }
        })

    } catch (err) {
        res.status(500).send("Internal Server Error")
    }
}
//User logout controller
const userLogout = async (req,res) => {
    const request = new sql.Request();
    try {
        request.query(`
            DELETE FROM tbl_Yad2_tokens 
            OUTPUT deleted.* 
            WHERE Token = '${req.cookies.AuthToken}'`, (error,result) => {
                if(error) {
                    console.log(error);
                    throw new Error();
                } else {
                    res.clearCookie("AuthToken");
                    if(result.recordset.length !== 0) {
                        return res.status(200).send("Logged Out successfully");
                    }
                    return res.status(400).send("Unauthorized");
                }
        })
        
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
}
//Check valid token controller
const checkValidToken = async (req,res) => {
    res.status(200).send({
        name:req.user.Name,
        surname:req.user.Surname,
        cellphone: req.user.Cellphone,
        email: req.user.Email,
    })
}

//Publish Realestate Util Funcs
const translateFeaturesToSQL = (featuresObj) => {
    const features = {
        AirConditioned: false,
        Mamad: false,
        Storage: false,
        Furniture: false,
        Accessability: false,
        Elevator: false,
        Tadiran: false,
        Renovated: false,
        KosherKitchen: false,
        WaterHeater: false,
        WindowBars: false,
    }
    Object.keys(featuresObj).filter((key)=>featuresObj[key]).forEach((key)=>{
        switch(key) {
            case 'מיזוג': {
                features.AirConditioned = true;
                break;
            }
            case 'ממ"ד': {
                features.Mamad = true;
                break;
            }
            case 'מחסן': {
                features.Storage = true;
                break;
            }
            case 'ריהוט': {
                features.Furniture = true;
                break;
            }
            case 'משופצת': {
                features.Renovated = true;
                break;
            }
            case 'מזגן תדיראן': {
                features.Tadiran = true;
                break;
            }
            case 'מעלית': {
                features.Elevator = true;
                break;
            }
            case 'גישה לנכים': {
                features.Accessability = true;
                break;
            }
            case 'מטבח כשר': {
                features.KosherKitchen = true;
                break;
            }
            case 'דוד שמש': {
                features.WaterHeater = true;
                break;
            }
            case 'סורגים': {
                features.WindowBars = true;
                break;
            }
            default : {
                break;
            }
        }
    })
    return features;
}
const insertRealestateDataToDB = async (realestateData) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`INSERT INTO dbo.tbl_Yad2_realestate_realestate_data
        (Balconies,BuiltArea,Category,City,Description,EntryDate,EntryFlexible,EntryNow,EstateCondition,EstateType,
         Floor,MainImageURL,Number,OnPillars,ParkingSpots,Price,Rooms,Street,TotalArea,TotalFloors)
         VALUES ('${realestateData.balconies}',
                 '${realestateData.builtArea}',
                 '${realestateData.category}',
                 '${realestateData.city.replace("'","''")}',
                 '${realestateData.description.replace("'","''")}',
                 '${realestateData.entryDate}',
                 '${realestateData.entryFlexible}',
                 '${realestateData.entryNow}',
                 '${realestateData.estateCondition}',
                 '${realestateData.estateType.replace("'","''")}',
                 '${realestateData.floor}',
                 '${realestateData.mainImage}',
                 '${realestateData.number}',
                 '${realestateData.onPillars}',
                 '${realestateData.parkingSpots}',
                 '${realestateData.price}',
                 '${realestateData.rooms}',
                 '${realestateData.street.replace("'","''")}',
                 '${realestateData.totalArea}',
                 '${realestateData.totalFloors}')
                  SELECT Id = IDENT_CURRENT('tbl_Yad2_realestate_realestate_data')`)
        return result.recordset[0].Id;     
    } catch (err) {
        console.log(err);
        throw new Error();
    }
}
const insertUserDataToDB = async (userData) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`INSERT INTO dbo.tbl_Yad2_realestate_user_data
        (AdMailingList,AddToMailingList,ContactCellphone,ContactEmail,ContactMailingList,ContactName,
         ContactTerms,ContactVirtualNumber,ContactWeekend,SecondaryContactCellphone,SecondaryContactName)
        VALUES ('${userData.adMailingList}',
                '${userData.addToMailingList}',
                '${userData.contactCellphone}',
                '${userData.contactEmail}',
                '${userData.contactMailingList}',
                '${userData.contactName}',
                '${userData.contactTerms}',
                '${userData.contactVirtualNumber}',
                '${userData.contactWeekend}',
                '${userData.secondaryContactCellphone}',
                '${userData.secondaryContactName}')
        SELECT Id = IDENT_CURRENT('tbl_Yad2_realestate_user_data')`)
        return result.recordset[0].Id;     
    } catch (err) {
        console.log(err);
        throw new Error();
    }
}
const insertRealestateFeaturesIntoDB = async (features) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`INSERT INTO dbo.tbl_Yad2_realestate_features
        (AirConditioned,Mamad,Storage,Furniture,Accessability,Elevator,
         Tadiran,Renovated,KosherKitchen,WaterHeater,WindowBars)
        VALUES ('${features.AirConditioned}',
                '${features.Mamad}',
                '${features.Storage}',
                '${features.Furniture}',
                '${features.Accessability}',
                '${features.Elevator}',
                '${features.Tadiran}',
                '${features.Renovated}',
                '${features.KosherKitchen}',
                '${features.WaterHeater}',
                '${features.WindowBars}')
        SELECT Id = IDENT_CURRENT('tbl_Yad2_realestate_features')`)
        return result.recordset[0].Id;     
    } catch (err) {
        console.log(err);
        throw new Error();
    }
}
const insertRealestatePostIntoDB = async (realestatePost) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`INSERT INTO dbo.tbl_Yad2_realestate_realestate_post
        (RealestateDataId,UserDataId,RealestateFeaturesId,PublishPlan,OwnerId,Date)
        VALUES ('${realestatePost.realestateDataId}',
                '${realestatePost.userDataId}',
                '${realestatePost.realestateFeaturesId}',
                '${realestatePost.PublishPlan}',
                '${realestatePost.OwnerId}',
                '${realestatePost.Date}')
        SELECT Id = IDENT_CURRENT('tbl_Yad2_realestate_realestate_post')`)
        return result.recordset[0].Id;     
    } catch (err) {
        console.log(err);
        throw new Error();
    }
}
const insertRealestateImageIntoDB = async (images,postId) => {
    try {
        const request = new sql.Request();
        let valuesStr = "";
        for(img of images) {
            valuesStr += `('${postId}','${img}'),`;
        }
        valuesStr = valuesStr.slice(0,-1);
        const result = await request.query(`INSERT INTO dbo.tbl_Yad2_realestate_images
        (RealestatePostId,ImageURL)
        VALUES ${valuesStr}`)    
    } catch (err) {
        console.log(err);
        throw new Error();
    }
}

//Publish realestate controller
const publishRealestate = async (req,res) => {
    const realestateData = {
        category: req.body.category,
        estateType: req.body.estateType,
        estateCondition: req.body.estateCondition,
        city: req.body.city,
        street: req.body.street,
        number: req.body.number,
        floor: req.body.floor,
        totalFloors: req.body.totalFloors,
        onPillars: req.body.onPillars,
        addToMailingList: req.body.addToMailingList,
        rooms: req.body.rooms,
        parkingSpots: req.body.parkingSpots,
        balconies: req.body.balconies,
        description: req.body.description,
        totalArea: req.body.totalArea,
        builtArea: req.body.builtArea,
        price: req.body.price,
        entryDate: req.body.entryDate,
        entryNow: req.body.entryNow,
        entryFlexible: req.body.entryFlexible,
        mainImage: req.body.mainImage,
    }
    const userData = {
        adMailingList: req.body.adMailingList,
        addToMailingList: req.body.addToMailingList,
        contactName: req.body.contactName,
        contactCellphone: req.body.contactCellphone,
        contactEmail: req.body.contactEmail,
        contactVirtualNumber: req.body.contactVirtualNumber,
        contactWeekend: req.body.contactWeekend,
        contactMailingList: req.body.contactMailingList,
        contactTerms: req.body.contactTerms,
        secondaryContactName: req.body.secondaryContactName,
        secondaryContactCellphone: req.body.secondaryContactCellphone,
    }
    const features = translateFeaturesToSQL(req.body.features);
    const images = req.body.images;
    try {
        const realestatePost = {
            realestateDataId: await insertRealestateDataToDB(realestateData),
            userDataId: await insertUserDataToDB(userData),
            realestateFeaturesId: await insertRealestateFeaturesIntoDB(features),
            PublishPlan: req.body.publishPlan,
            OwnerId: req.user.Id,
            Date: new Date().toISOString().slice(0, 10),
        }
        const postId = await insertRealestatePostIntoDB(realestatePost);
        if(images.length > 0) {
            await insertRealestateImageIntoDB(images,postId);
        }
        res.status(201).send("Realestate published!");
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
    res.send();
}

module.exports = {
    checkEmailAvailability,
    registerUser,
    checkValidToken,
    userLogin,
    userLogout,
    publishRealestate,
}