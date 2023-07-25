#!/usr/bin/env node

const axios = require('axios');
const { program } = require('commander');
const { parseString } = require('xml2js');

const CB_API_URL = 'https://www.cbr.ru/scripts/XML_daily.asp';

function formatCurrencyValue(value) {
  return value.toString().replace('.', ',');
}

async function getCurrencyRates(code, date) {
  try {
    const response = await axios.get(CB_API_URL, {
      params: {
        date,
      },
    });

    parseString(response.data, (err, result) => {
      if (err) {
        console.error('Error parsing XML:', err.message);
        return;
      }

      const currency = result.ValCurs.Valute.find((valute) => valute.CharCode[0] === code.toUpperCase());

      if (!currency) {
        console.log('Currency not found.');
        return;
      }

      console.log(`${currency.CharCode[0]} (${currency.Name[0]}): ${formatCurrencyValue(currency.Value[0])}`);
    });
  } catch (error) {
    console.error('Error fetching currency rates:', error.message);
  }
}

program
  .option('--code <code>', 'Currency code in ISO 4217 format')
  .option('--date <date>', 'Date in YYYY-MM-DD format')
  .parse(process.argv);

const { code, date } = program.opts();

if (!code || !date) {
  console.log('Please provide both currency code and date.');
} else {
  getCurrencyRates(code, date);
}
