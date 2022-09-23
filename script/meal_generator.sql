USE [WAD-MMD-CSD-S21_10407738]
GO

-- prefix: "gen"

--1) dropping all the tables and constaints for the
-- order: genPassword, genAccount, genProfile, genRole
-- have to drop the dependencies before a table can be dropped


ALTER TABLE dbo.genRecipe
DROP CONSTRAINT IF EXISTS genFK_Recipe_RecipeType
GO
ALTER TABLE dbo.genRecipe
DROP CONSTRAINT IF EXISTS genFK_Recipe_PostStatus
GO

ALTER TABLE dbo.genRecipe
DROP CONSTRAINT IF EXISTS genFK_Recipe_Profile
GO

ALTER TABLE dbo.genRecipe
DROP CONSTRAINT IF EXISTS genFK_Recipe_Account
GO
DROP TABLE IF EXISTS dbo.genRecipe
GO

DROP TABLE IF EXISTS dbo.genRecipeType
GO

DROP TABLE IF EXISTS dbo.genPostStatus
GO

ALTER TABLE dbo.genPassword
DROP CONSTRAINT IF EXISTS genFK_Password_Account
GO
DROP TABLE IF EXISTS genPassword

ALTER TABLE dbo.genAccount
DROP CONSTRAINT IF EXISTS genFK_Account_Profile
GO
ALTER TABLE dbo.genAccount
DROP CONSTRAINT IF EXISTS genFK_Account_Role
GO
DROP TABLE IF EXISTS genAccount
GO

DROP TABLE IF EXISTS genProfile
GO

DROP TABLE IF EXISTS genRole
GO



--2) table definitions
-- order: genRole, genProfile, genAccount, genPassword, genPostStatus, genRecipeType, genRecipe
CREATE TABLE dbo.genRole 
(
    roleid INT NOT NULL IDENTITY PRIMARY KEY,
    -- primary key: roleid
    rolename NVARCHAR(50) NOT NULL,
    roledesc NVARCHAR(255),
);
GO

CREATE TABLE dbo.genProfile
(
    profileid INT NOT NULL IDENTITY PRIMARY KEY,
    -- primary key: profileid
    displayname NVARCHAR(50) NOT NULL DEFAULT 'Anonym',
    profiledesc NVARCHAR(255),
)
GO

CREATE TABLE dbo.genAccount
(
    accountid INT NOT NULL IDENTITY PRIMARY KEY,
    accountgenname NVARCHAR(50) NOT NULL UNIQUE,
    accountemail NVARCHAR(255) NOT NULL UNIQUE,
    FK_roleid INT NOT NULL DEFAULT 1, 
    FK_profileid INT UNIQUE,

    CONSTRAINT genFK_Account_Role FOREIGN KEY (FK_roleid) REFERENCES dbo.genRole(roleid),
    CONSTRAINT genFK_Account_Profile FOREIGN KEY (FK_profileid) REFERENCES dbo.genProfile(profileid),
);
GO

CREATE TABLE dbo.genPassword
(
    FK_accountid INT NOT NULL UNIQUE,
    hashedpassword NVARCHAR(255),

    CONSTRAINT genFK_Password_Account FOREIGN KEY (FK_accountid) REFERENCES dbo.genAccount(accountid),
);
GO

CREATE TABLE dbo.genPostStatus
(
    poststatusid INT IDENTITY NOT NULL PRIMARY KEY ,
    poststatusname NVARCHAR(50) NOT NULL DEFAULT 'Pending',
);

CREATE TABLE dbo.genRecipeType
(
    recipetypeid INT IDENTITY NOT NULL PRIMARY KEY,
    recipetypename NVARCHAR(50) NOT NULL,
);

CREATE TABLE dbo.genRecipe
(
recipeid INT IDENTITY NOT NULL PRIMARY KEY,
recipename NVARCHAR(255) NOT NULL,
recipedesc NVARCHAR(max),
recipekcal INT NOT NULL,
FK_accountid INT NOT NULL,
FK_profileid INT NOT NULL,
recipeimg NVARCHAR(MAX),
recipeingredients NVARCHAR(MAX),
FK_poststatusid INT NOT NULL,
FK_recipetypeid INT NOT NULL,
 
CONSTRAINT genFK_Recipe_Account FOREIGN KEY (FK_accountid) REFERENCES dbo.genAccount(accountid),
CONSTRAINT genFK_Recipe_Profile FOREIGN KEY (FK_profileid) REFERENCES dbo.genProfile(profileid),
CONSTRAINT genFK_Recipe_PostStatus FOREIGN KEY (FK_poststatusid) REFERENCES dbo.genPostStatus(poststatusid),
CONSTRAINT genFK_Recipe_RecipeType FOREIGN KEY (FK_recipetypeid) REFERENCES dbo.genRecipeType(recipetypeid),
);


-- SELECT * FROM genRole
-- SELECT * FROM genProfile
-- SELECT * FROM genAccount
-- SELECT * FROM genPassword
-- SELECT * FROM genPostStatus
-- SELECT * FROM genRecipeType
-- SELECT * FROM genRecipe

--3) populating test data
INSERT INTO dbo.genRole
    ([rolename], [roledesc])
VALUES
    ('member', 'Can use the app and suggest new recipes.'),
    ('admin', 'Can use the app as well as accept and upload new recipes suggested by the member, and edit/delete the content.')
GO

SELECT * FROM genRole
GO

INSERT INTO dbo.genProfile
    ([displayname], [profiledesc])
VALUES
    ('Marek', 'I love cooking and eating.'),
    ('Ola', 'I love traveling and expirencing different cultures through food.'),
    ('Jeppe', 'I love spareribs.'),
    ('Reinis', NULL)
GO

SELECT * FROM genProfile
GO

INSERT INTO dbo.genAccount
    ([accountgenname], [accountemail], [FK_roleid], [FK_profileid])
VALUES
    ('masterchef', 'marek@abc.com', 1, 1),
    ('Icookgood', 'ola@abc.com', 2, 2),
    ('Heppe', 'jeppe@abc.com', 2, 3),
    ('ReinisComming', 'reinis@abc.com', 1, 4)
GO

SELECT * FROM genAccount
GO

INSERT INTO dbo.genPassword
    ([FK_accountid], [hashedpassword])
VALUES
    (1, '$2a$13$Q2jY.Mj2BDR1cXCuw3.8XuaoacsCg/5qtTmwt66AeNsSJLd/qEBPO'),
    (2, '$2a$13$NMHMd75HwjKB2H2oumBQdurBTFfnrHy.pQnv/lrUcqIWuwODZU8QG'),
    (3, '$2a$13$oeaCLVbu0hTcK7fpmQ1giOs0cw3fEMflMNnkwwNzU3ci4gE.Gm4xu'),
    (4, '$2a$13$XSX7tD2Yue7C9LCL4fm61O5CGPnnMsRxAQmUZgzZvJ2Lln05nPhmi')
GO

SELECT * FROM dbo.genPassword
-- loginname/(raw)password:
-- ========================
-- masterchef/cat
-- Icookgood/dog
-- Heppe/cat
-- ReinisComming/frog



INSERT INTO dbo.genPostStatus
    ([poststatusname])
VALUES 
    ('Published'),
    ('Pending'),
    ('Denied')
GO

SELECT * FROM dbo.genPostStatus
GO

INSERT INTO dbo.genRecipeType
    ([recipetypename])
VALUES 
    ('Breakfast'),
    ('Lunch'),
    ('Dinner')
GO

SELECT * FROM dbo.genRecipeType
GO

INSERT INTO dbo.genRecipe
    ([recipename], [recipedesc], [recipekcal], [FK_accountid], [FK_profileid], [recipeimg], [recipeingredients], [FK_poststatusid], [FK_recipetypeid])
VALUES 
    ('Scrambled Eggs with Onion, Pepper, Tomato and Mushrooms', 'Fast and healthy breakfast, even for those who dont have culinary skills.', 173, 2, 2, 'https://unsplash.com/photos/UUHqskar490', 'Eggs, Onion, Pepper, Tomato, Mushrooms, Butter.', 1, 1),
    ('Nutella French Toast', 'This ultimate sweet breakfast is perfect when you dont have many products in your kitchen, but want to start the day with a tasty and simple meal.', 590, 1, 1, 'https://unsplash.com/photos/lEFjl4N2QEA', 'Nutella, Butter, Egg, Toast Bread, Banana', 1, 1),
    ('Overnight oats', 'Perfect for those who dont have much time in the morning, but care about their diet and plan their meals.', 148, 4, 4, 'https://unsplash.com/photos/UdRSs4L5atQ', 'Bread, Butter, Mayonaise, Romaine, Tomato, Salt, Black pepper, Bacon, Cheddar, Turkey, Ham', 1, 1),
    ('American Pancakes', 'Who wouldnt love these? Nice and fluffy, perfect with maple syrup and some fresh berries. Nice to have in the lazy morning on the weekend.', 385, 3, 3, 'https://unsplash.com/photos/8Nc_oQsc2qQ', 'Flour, Eggs, Milk, Sugar, Baking Powder, Salt', 1, 1),
    ('English Breakfast', 'Rich in both calories and taste, good with coffee or tea. It will give you a lot of energy for the day!', 783, 1, 1, 'https://unsplash.com/photos/shmr_KoBQXQ', 'Eggs, Bacon, Toasted Bread, Sausages, Baked beans', 1, 1),
    ('Smørrebrød', 'This BLT is classic: bacon, lettuce, and tomato — nothing fancy, just delicious.', 216, 1, 1, 'https://unsplash.com/photos/FZ4y_IDUJ6w', 'Bacon, Lettuce, Tomato, Bread, Mayonnaise', 1, 2),
    ('Club sandwich', 'With ham, turkey, bacon and 3 slices of bread, the club sandwich is the quite possibly best sandwich of all time. It has three layers that are absolutely packed with flavor.', 220, 4, 4, 'https://unsplash.com/photos/VsaXdUF-fnE', 'Bread, Butter, Mayonaise, Romaine, Tomato, Salt, Black pepper, Bacon, Cheddar, Turkey, Ham', 1, 2),
    ('Carbonara', 'This cheesy pasta dish is an Italian favourite and with the right technique, you can make it perfect every time', 156, 3, 3, 'https://unsplash.com/photos/DGwBTYl9y_Q', 'Pancetta, Pecorino, Parmesan, Eggs, Spaghetti, Garlic, Unsalted butter, Salt, Black pepper', 1, 2),
    ('Beetroot soup', 'This delicious chunky borscht soup is made with fresh beets, beef shank, onions, carrots, potatoes, cabbage, and dill, then topped with a dollop of sour cream. It’s a great recipe for a chilly day!', 32, 2, 2, 'https://unsplash.com/photos/U9DW1GGTTXw', 'Olive oil, Onion, Garlic, Celery, Carrots, Beets, Red cabbage, Beet stems, Chicken stock, Tomato paste, Celery seed, Allspice, Salt, Pepper, Cayenne, Apple cider vinegar, Fresh dill, Sour cream', 1, 2),
    ('Kung Pao Chicken', 'This spicy kung pao chicken is similar to what is served in Chinese restaurants. Its easy to make, and you can be as creative with the measurements as you want. The sauce reduces until nice and thick. Substitute cashews for peanuts, or bamboo shoots for the water chestnuts. You cant go wrong! Enjoy!', 129, 1, 1, 'https://www.freepik.com/free-photo/homemade-kung-pao-chicken-with-peppers-vegetables-chinese-food-stir-fry_6733662.htm#query=kung%20pao%20chicken&position=3&from_view=keyword', 'Cornstarch, White wine, Soy sauce, Sesame oil, Chicken breast, Hot chile paste, Brown sugar, Distilled white vinegar, Can water chestnuts,  Chopped peanuts, Green onions, Garlic ', 1, 2),
    ('Butter chicken', 'The most popular curry in the world!', 355, 3, 3, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80', 'Chicken breast, plain yoghurt, ginger garlic paste, olive oil, coriander seed , Kashimiri Lai Mirich, cumin, salt', 1, 3),
    ('Baked potato with chicken', 'Easy, fast and tasty', 547, 2, 2, 'https://www.jessicagavin.com/wp-content/uploads/2016/12/chicken-broccoli-stuffed-baked-potato-with-cheddar-cheese-sauce-1.jpg', 'russet potatoes, olive oil, kosher salt, black pepper, boneless chicken breast, paprika, butter, milk, pepper, cheese, grated, broccoli florets', 1, 3),
    ('Sweet Potato with bacon', 'Cheap and tasty meal', 301, 3, 3, 'https://natashaskitchen.com/wp-content/uploads/2016/10/maple-roasted-sweet-potatoes-and-bacon-5.jpg', 'Olive oil, Garlic, Sea salt, pepper, bacoo, maple syrup', 1, 3),
    ('Cordon bleu', 'Shnitzel filled with ham!', 409, 2, 2, 'https://img.freepik.com/free-photo/chicken-cordon-bleu-with-potatoes-rural-salad-sauce-plate_140725-10840.jpg?w=1800&t=st=1662499868~exp=1662500468~hmac=566a2cff561c0b6ba9a91dc2475ac092ffdeb5721a454ad5c51d8d8f878f8d72', 'Swiss cheese, salt, pepper, chicken breast, plain flavour, buttter, milk, ham', 1, 3),
    ('Homemade Pizza', 'Do you own pizza at home!', 150, 3, 3, 'https://images.unsplash.com/photo-1614442316719-1e38c661c29c?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8aG9tZW1hZGUlMjBwaXp6YXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=1400&q=60', 'bread flour, kosher salt, sugar, active dry yeast, olive oil, cheese, tomato sauce, ham, mozzarella cheese', 1, 3)
GO

SELECT * FROM dbo.genRecipe
GO

