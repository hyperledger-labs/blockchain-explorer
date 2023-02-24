
import React, { useEffect, useState } from 'react'
import { txnListType } from '../types';
import { IconButton, TextField, Select, MenuItem, InputAdornment, makeStyles } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { withRouter } from 'react-router-dom';
import Dialog from '@material-ui/core/Dialog';
import TransactionView from '../View/TransactionView';
import BlockView from '../View/BlockView';

const useStyles = makeStyles((theme) => ({
  searchField: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& .MuiOutlinedInput-input': {
      padding: '16px 14px'
    }
  },
  searchInput: {
    marginRight: theme.spacing(0),
    '& > div': {
      paddingRight: '24px !important',
    }
  },
  iconButton: {
    height: 40,
    width: 40,
    color: '#21295c',
    backgroundColor: '#b9d6e1',
    borderRadius: 15
  }
}));


const SearchByQuery = (props) => {
  let { txnList } = props;
  let { blockSearch } = props;
  const classes = useStyles();
  const options = ["Txn Hash", "Block No"]
  const [search, setSearch] = useState("")
  const [selectedOption, setSelectedOption] = useState("Txn Hash")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState(props.searchError)
  const [searchClick, setSearchClick] = useState(false);

  useEffect(() => {
    if (props.searchError || searchClick) {
      setSearchClick(false); setError(props.searchError) }
  }, [props.searchError, searchClick])

  const searchData = async () => {
    if (selectedOption === "Txn Hash") {
      await props.getTxnList(props.currentChannel, search)
    } else if (selectedOption === "Block No") {
      await props.getBlockSearch(props.currentChannel, search)
    }
    handleDialogOpen();
    setSearchClick(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!search || (selectedOption === "Block No" && (isNaN(search) || search.length > 9))) {
      setError("Please enter valid txn hash/block no")
      return
    }
    searchData();

  }

  const handleDialogOpen = () => {
    setDialogOpen(true)

  }

  const handleDialogClose = () => {
    setDialogOpen(false)
  }
  
  return (
    <div className={classes.searchField}>
      <form onSubmit={handleSubmit}>
        <Select
          value={selectedOption}
          onChange={(e) => { setSelectedOption(e.target.value); if (error) { setDialogOpen(false); setError('') } }}
          className={classes.searchInput}
          displayEmpty
          variant='outlined'
          style={{ width: 110 }}
          MenuProps={{
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left"
            },
            getContentAnchorEl: null
          }}
        >
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>

          ))}
        </Select>
        <TextField
          value={search}
          onChange={(e) => { setSearch(e.target.value); if (error) { setDialogOpen(false); setError(''); } }}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
          label=" Search by Txn Hash / Block"
          variant='outlined'
          style={{ width: 550 }}
          error={error}
          helperText={error}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton onClick={handleSubmit} className={classes.iconButton}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </form>
      <Dialog
        open={dialogOpen && !error}
        onClose={handleDialogClose}
        fullWidth
        maxWidth="md"
      >
        {!error && selectedOption === 'Block No' ? <BlockView blockHash={blockSearch} onClose={handleDialogClose} />
          : <TransactionView transaction={txnList} onClose={handleDialogClose} />
        }
      </Dialog>
    </div>
  )
}
SearchByQuery.propTypes = {
  txnList: txnListType.isRequired
};


export default withRouter(SearchByQuery)