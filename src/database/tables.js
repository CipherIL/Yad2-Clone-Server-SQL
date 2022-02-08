const {sql} = require('./sql');

const checkAndBuildTables = async () => {
    await checkAndBuildUsersTable();
    await checkAndBuildTokensTable();
    await checkAndBuildRealestatePostTable();
    await checkAndBuildRealestateDataTable();
    await checkAndBuildRealestateImagesTable();
    await checkAndBuildRealestateFeaturesTable();
    await checkAndBuildRealestatePostUserDataTable();
}

const checkIfTableExists = async (tableName) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`
            EXEC sp_tables
            @table_name = '${tableName}',
            @table_type = "'TABLE'"
        `)
        return result.recordset.length !== 0;
    } catch (error) {
        console.log(error);
    }
}

const checkAndBuildUsersTable = async () => {
    try {
        const res = await checkIfTableExists('tbl_Yad2_users');
        if (!res) {
            const request = new sql.Request();
            await request.query(`
                Create Table tbl_Yad2_users (Id int Identity(1,1) NOT NULL,
                                            Email Nvarchar(50) NOT NULL,
                                            Password Nvarchar(70) NOT NULL,
                                            Name Nvarchar(50) NOT NULL,
                                            Surname Nvarchar(50) NOT NULL,
                                            Cellphone Nvarchar(50) NOT NULL,
                                            OnMailingList bit NOT NULL,
                                            Constraint PK_User_Id Primary Key (Id),
                                            Constraint UC_User_Email Unique (Email)
            );`)
        }
    } catch (error) {
        console.log(error)
    }
}

const checkAndBuildTokensTable = async () => {
    try {
        const res = await checkIfTableExists('tbl_Yad2_tokens');
        if (!res) {
            const request = new sql.Request();
            await request.query(`Create Table tbl_Yad2_tokens (
                                Token varchar(200) NOT NULL,
                                Constraint UC_Token Unique (Token)
            );`)
        }
    } catch (error) {
        console.log(error)
    }
}

const checkAndBuildRealestateFeaturesTable = async () => {
    try {
        const res = await checkIfTableExists('tbl_Yad2_realestate_features');
        if (!res) {
            const request = new sql.Request();
            await request.query(`Create Table tbl_Yad2_realestate_features (
                                Id int Identity(1,1) PRIMARY KEY NOT NULL,
                                AirConditioned bit NOT NULL,
                                Mamad bit NOT NULL,
                                Storage bit NOT NULL,
                                Furniture bit NOT NULL,
                                Accessability bit NOT NULL,
                                Elevator bit NOT NULL,
                                Tadiran bit NOT NULL,
                                Renovated bit NOT NULL,
                                KosherKitchen bit NOT NULL,
                                WaterHeater bit NOT NULL,
                                WindowBars bit NOT NULL,
            );`)
        }
    } catch (error) {
        console.log(error)
    }
}

const checkAndBuildRealestateImagesTable = async () => {
    try {
        const res = await checkIfTableExists('tbl_Yad2_realestate_images');
        if (!res) {
            const request = new sql.Request();
            await request.query(`Create Table tbl_Yad2_realestate_images (
                                RealestatePostId int NOT NULL,
                                ImageURL NVarChar(400) NOT NULL);
                                CREATE CLUSTERED INDEX IX_RealestatePostId 
                                ON tbl_Yad2_realestate_images(RealestatePostId ASC)`)
        }
    } catch (error) {
        console.log(error)
    }
}

const checkAndBuildRealestatePostUserDataTable = async () => {
    try {
        const res = await checkIfTableExists('tbl_Yad2_realestate_user_data');
        if (!res) {
            const request = new sql.Request();
            await request.query(`Create Table tbl_Yad2_realestate_user_data (
                                Id int Identity(1,1) PRIMARY KEY NOT NULL,
                                AdMailingList bit NOT NULL,
                                AddToMailingList bit NOT NULL,
                                ContactCellphone NVarChar(50) NOT NULL,
                                ContactEmail NVarChar(50) NOT NULL,
                                ContactMailingList bit NOT NULL,
                                ContactName NvarChar(50) NOT NULL,
                                ContactTerms bit NOT NULL,
                                ContactVirtualNumber bit NOT NULL,
                                ContactWeekend bit NOT NULL,
                                SecondaryContactCellphone NVarChar(50) NOT NULL,
                                SecondaryContactName NVarChar(50) NOT NULL,
            );`)
        }
    } catch (error) {
        console.log(error)
    }
}

const checkAndBuildRealestateDataTable = async () => {
    try {
        const res = await checkIfTableExists('tbl_Yad2_realestate_realestate_data');
        if (!res) {
            const request = new sql.Request();
            await request.query(`CREATE Table tbl_Yad2_realestate_realestate_data (
                                Id int Identity(1,1) PRIMARY KEY NOT NULL,
                                Balconies NVarChar(10) NOT NULL,
                                BuiltArea Int NOT NULL,
                                Category NVarChar(50) NOT NULL,
                                City NVarChar(70) NOT NULL,
                                Description NVarChar(410) NOT NULL,
                                EntryDate DATETIME NOT NULL,
                                EntryFlexible BIT NOT NULL,
                                EntryNow BIT NOT NULL,
                                EstateCondition NVarChar(50) NOT NULL,
                                EstateType NVarChar(50) NOT NULL,
                                Floor Int NOT NULL,
                                MainImageURL NVarChar(200) NOT NULL,
                                Number NvarChar(10) NOT NULL,
                                OnPillars BIT NOT NULL,
                                ParkingSpots NVarChar(10) NOT NULL,
                                Price Int NOT NULL,
                                Rooms DECIMAL(3,1) NOT NULL,
                                Street NVarChar(50) NOT NULL,
                                TotalArea Int NOT NULL,
                                TotalFloors Int NOT NULL,
            );`)
        }
    } catch (error) {
        console.log(error)
    }
}

const checkAndBuildRealestatePostTable = async () => {
    try {
        const res = await checkIfTableExists('tbl_Yad2_realestate_realestate_post');
        if (!res) {
            const request = new sql.Request();
            await request.query(`CREATE Table tbl_Yad2_realestate_realestate_post (
                                Id int Identity(1,1) PRIMARY KEY NOT NULL,
                                RealestateDataId Int NOT NULL,
                                UserDataId Int NOT NULL,
                                RealestateFeaturesId Int NOT NULL,
                                PublishPlan NVarChar(50) NOT NULL,
                                OwnerId Int NOT NULL,
                                Date DATETIME NOT NULL,
            );`)
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = checkAndBuildTables;