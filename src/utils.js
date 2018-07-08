export const makeDate = seconds => {
  const date = new Date(null);
  date.setSeconds(seconds);
  return date.toUTCString();
};

export const stringToJSON = string => {
  try {
    return JSON.parse(string);
  } catch(e){
    console.log(e);
  }
}

export const parseMessage = (message) => {
  if(typeof message.data === "string"){
    const {data} = message;
    const parsedMessage = stringToJSON(data);
    if(parsedMessage !== null){
      const { type } = parsedMessage;
      if(type === "BLOCKCHAIN_RESPONSE"){
        return parsedMessage.data;
      }else{
        return null;
      }
    }
  }
}
