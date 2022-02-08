const {sql} = require('../database/sql');

const getFilters = (data) => {
    console.log(data)
    let filtersString = "WHERE ";
    Object.keys(data).forEach((key)=>{
        switch(key) {
            case 'category': {
                if(data[key]!=="") {
                    filtersString += `Category = '${data[key]}' AND `;
                }
                break;
            }
            case 'address': {
                if(typeof data[key] === 'object') {
                    filtersString += `Street = '${data[key].street}' AND City = '${data[key].cities[0]}' AND `;
                } else {
                    if(data[key]!=="")
                        filtersString += `City = '${data[key]}' AND `;
                }
                break;
            }
            case 'minRooms': {
                if(data[key]!=="") {
                    filtersString += `Rooms >= ${data[key]} AND `;
                }
                break;
            }
            case 'maxRooms': {
                if(data[key]!=="") {
                    filtersString += `Rooms <= ${data[key]} AND `;
                }
                break;
            }
            case 'minPrice': {
                if(data[key]!=="") {
                    filtersString += `Price >= ${data[key]} AND `;
                }
                break;
            }
            case 'maxPrice': {
                if(data[key]!=="") {
                    filtersString += `Price <= ${data[key]} AND `;
                }
                break;
            }
            case 'minFloor': {
                if(data[key]!=="") {
                    filtersString += `Floor >= ${data[key]} AND `;
                }
                break;
            }
            case 'maxFloor': {
                if(data[key]!=="") {
                    filtersString += `Floor <= ${data[key]} AND `;
                }
                break;
            }
            case 'minArea': {
                if(data[key]!=="") {
                    filtersString += `TotalArea >= ${data[key]} AND `;
                }
                break;
            }
            case 'maxArea': {
                if(data[key]!=="") {
                    filtersString += `TotalArea <= ${data[key]} AND `;
                }
                break;
            }
            case 'entryNow': {
                if(data[key]) {
                    filtersString += `EntryNow = 1 AND `;
                }
                break;
            }
            case 'freeText': {
                if(data[key]!=="") {
                    filtersString += `CHARINDEX('${data[key]}',Description) != 0 AND `
                }
                break;
            }
            case 'features': {
                data[key].forEach((feature)=>{
                    switch(feature) {
                        case 'מיזוג':{
                            filtersString += 'AirConditioned = 1 AND '
                            break;
                        }
                        case 'ממ"ד':{
                            filtersString += 'Mamad = 1 AND '
                            break;
                        }
                        case 'מחסן':{
                            filtersString += 'Storage = 1 AND '
                            break;
                        }
                        case 'מרוהטת':{
                            filtersString += 'Furniture = 1 AND '
                            break;
                        }
                        case 'גישה לנכים':{
                            filtersString += 'Accessability = 1 AND '
                            break;
                        }
                        case 'מעלית':{
                            filtersString += 'Elevator = 1 AND '
                            break;
                        }
                        case 'מזגן תדיראן':{
                            filtersString += 'Tadiran = 1 AND '
                            break;
                        }
                        case 'סורגים':{
                            filtersString += 'WindowBars = 1 AND '
                            break;
                        }
                        case 'משופצת':{
                            filtersString += 'Renovated = 1 AND '
                            break;
                        }
                        default: {
                            break;
                        }
                    }
                })
                break;
            }
            case 'types': {
                const types = Object.values(data[key]).flat();
                if(types.length > 0) {
                    let str = 'EstateType IN (';
                    types.forEach(type=>{
                        str+= `'${type.replace("'","''")}',`;
                    })
                    filtersString += str.slice(0,-1) + ') AND ';
                }
                break;
            }
            default: {
                break;
            }
        }
    })
    if(filtersString === "WHERE ") return "";
    return filtersString.slice(0,-4);
}

const getFilteredPosts = async (filters,skip,limit) => {
    const request = new sql.Request();
    const result = await request.query(`SELECT tbl_Yad2_realestate_realestate_post.Id,PublishPlan,
    [Balconies],[BuiltArea],[Category],[City],[Description],[EntryDate],[EntryFlexible],[EntryNow],
    [EstateCondition],[EstateType],[Floor],[MainImageURL],[Number],[OnPillars],[ParkingSpots],[Price],[Rooms],
    [Street],[TotalArea],[TotalFloors],[AirConditioned],[Mamad],[Storage],[Furniture],[Accessability],
    [Elevator],[Tadiran],[Renovated],[KosherKitchen],[WaterHeater],[WindowBars],[AdMailingList],
    [AddToMailingList],[ContactCellphone],[ContactEmail],[ContactMailingList],[ContactName],[ContactTerms],
    [ContactVirtualNumber],[ContactWeekend],[SecondaryContactCellphone],[SecondaryContactName]
    
    FROM 
    tbl_Yad2_realestate_realestate_post
    JOIN tbl_Yad2_realestate_realestate_data
    ON tbl_Yad2_realestate_realestate_post.RealestateDataId = tbl_Yad2_realestate_realestate_data.Id
    JOIN tbl_Yad2_realestate_features
    ON tbl_Yad2_realestate_realestate_post.RealestateFeaturesId = tbl_Yad2_realestate_features.Id
    JOIN tbl_Yad2_realestate_user_data
    ON tbl_Yad2_realestate_realestate_post.UserDataId = tbl_Yad2_realestate_user_data.Id
    
    ${filters}`);
    let posts = result.recordset.splice(skip,limit);
    return posts;
}

const translateRealestateFetures = (post) => {
    const featuresArr = [];
    Object.keys(post).forEach(key=>{
        switch(key) {
            case 'AirConditioned': {
                if(post[key]) featuresArr.push("מיזוג");
                break;
            }
            case 'Mamad': {
                if(post[key]) featuresArr.push('ממ"ד');
                break;
            }
            case 'Storage': {
                if(post[key]) featuresArr.push('מחסן');
                break;
            }
            case 'Furniture': {
                if(post[key]) featuresArr.push('ריהוט');
                break;
            }
            case 'Accessability': {
                if(post[key]) featuresArr.push('גישה לנכים');
                break;
            }
            case 'Elevator': {
                if(post[key]) featuresArr.push('מעלית');
                break;
            }
            case 'Tadiran': {
                if(post[key]) featuresArr.push('מזגן תדיראן');
                break;
            }
            case 'Renovated': {
                if(post[key]) featuresArr.push('משופצת');
                break;
            }
            case 'KosherKitchen': {
                if(post[key]) featuresArr.push('מטבח כשר');
                break;
            }
            case 'WaterHeater': {
                if(post[key]) featuresArr.push('דוד שמש');
                break;
            }
            case 'WindowBars': {
                if(post[key]) featuresArr.push('סורגים');
                break;
            }
            default: {
                break;
            }
        }
    })
    return featuresArr;
}

const getPostImages = async (postId) => {
    const request = new sql.Request();
    const result = await request.query(`SELECT * FROM tbl_Yad2_realestate_images 
                                WHERE tbl_Yad2_realestate_images.RealestatePostId = ${postId}`);
    const images = result.recordset.map(image=>image.ImageURL);
    return images;
}

const rebuildPosts = async (posts) => {
    const rebuiltPosts = [];
    for(const post of posts) {
        const realestateData = {
            balconies: post.Balconies,
            builtArea: post.BuiltArea,
            category: post.Category,
            city: post.City,
            description: post.Description,
            entryDate: post.EntryDate,
            entryFlexible: post.EntryFlexible,
            entryNow: post.EntryNow,
            estateCondition: post.EstateCondition,
            estateType: post.EstateType,
            features: translateRealestateFetures(post),
            floor: post.Floor,
            images: await getPostImages(post.Id),
            mainImage: post.MainImageURL,
            number: post.Number,
            onPillars: post.OnPillars,
            parkingSpots: post.ParkingSpots,
            price: post.Price,
            publishPlan: post.PublishPlan,
            rooms: post.Rooms,
            street: post.Street,
            totalArea: post.TotalArea,
            totalFloors: post.TotalFloors
        }
        const userData = {
            adMailingList: post.AdMailingList,
            addMailingList: post.AddMailingList,
            contactCellphone: post.ContactCellphone,
            contactEmail: post.ContactEmail,
            contactMailingList: post.ContactMailingList,
            contactName: post.ContactName,
            contactTerms: post.ContactTerms,
            contactVirtualNumber: post.ContactVirtualNumber,
            contactWeekend: post.ContactWeekend,
            secondaryContactCellphone: post.SecondaryContactCellphone,
            secondaryContactName: post.SecondaryContactName,
        }
        rebuiltPosts.push({realestateData,userData});
    }
    return rebuiltPosts;
}

const getRealestatePosts = async (req,res) => {
    try {
        const filters = getFilters(req.body.searchParams)
        const posts = await getFilteredPosts(filters,req.body.skip,req.body.limit)
        const builtPosts = await rebuildPosts(posts)
        console.log(filters)
        console.log(req.body.skip,req.body.limit)
        res.status(200).send(builtPosts);
    } catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error")
    }
}

module.exports = {getRealestatePosts};