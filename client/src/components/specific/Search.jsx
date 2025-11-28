import {
  Dialog,
  DialogTitle,
  InputAdornment,
  List,
  Stack,
  TextField,
} from "@mui/material";
import { useInputValidation } from "6pp";
import { Search as SearchIcon } from "@mui/icons-material";
import UserItem from "../shared/UserItem";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setIsSearch } from "../../redux/reducers/misc";
import {
  useLazySearchUserQuery,
  useSendFriendRequestMutation,
} from "../../redux/api/api";
import { useAsyncMutation } from "../../hooks/hook";

const Search = () => {
  const { isSearch } = useSelector((state) => state.misc);

  const [searchUser] = useLazySearchUserQuery();
  const [sendFriendRequest, isLoadingSendFriendRequest] = useAsyncMutation(
    useSendFriendRequestMutation
  );

  const dispatch = useDispatch();

  const search = useInputValidation("");

  const [users, setUsers] = useState([]);

  const addFriendHandler = async (id) => {
    await sendFriendRequest("Sending friend request...", { userId: id });
  };
  /*
  const addFriendHandler = async (id) => {
    console.log(id);
    try {
      const res = await sendFriendRequest(id).unwrap();

      if (res.success) {
        toast.success(res.message); // "Friend Request Sent"
        console.log(res);
      } else {
        // Defensive check for res.error before accessing it
        if (res.error && res.error.data && res.error.data.message) {
          toast.error(res.error.data.message);
        } else {
          toast.error("An error occurred while sending the friend request.");
        }
      }
    } catch (error) {
      // Use if-else to check error details
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error("Something Went Wrong");
      }
    }
  };
*/
  const searchCloseHandler = () => dispatch(setIsSearch(false));

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      searchUser(search.value)
        .then(({ data }) => setUsers(data.users))
        .catch((e) => console.log(e));
    }, 1000);

    return () => {
      clearTimeout(timeOutId);
    };
  }, [search.value]);

  return (
    /*
    <Dialog open={isSearch} onClose={searchCloseHandler}>
      <Stack p={"2rem"} direction={"column"} width={"25rem"}>
        <DialogTitle textAlign={"center"}>Find People</DialogTitle>
        <TextField
          label=""
          value={search.value}
          onChange={search.changeHandler}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <List>
          {users.map((i) => (
            <UserItem
              user={i}
              key={i._id}
              handler={addFriendHandler}
              handlerIsLoading={isLoadingSendFriendRequest}
            />
          ))}
        </List>
      </Stack>
    </Dialog>

    */

    <Dialog open={isSearch} onClose={searchCloseHandler}>
      <Stack direction="column" width="25rem" height="30rem">
        {/* Sticky Header */}
        <Stack
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: "white",
            borderBottom: "1px solid #ddd",
          }}
          p="1rem"
          spacing={2}
        >
          <DialogTitle sx={{ textAlign: "center", p: 0 }}>
            Find People
          </DialogTitle>
          <TextField
            label=""
            value={search.value}
            onChange={search.changeHandler}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        {/* Scrollable List */}
        <List
          sx={{
            flex: 1,
            overflowY: "auto",
          }}
        >
          {users.map((i) => (
            <UserItem
              user={i}
              key={i._id}
              handler={addFriendHandler}
              handlerIsLoading={isLoadingSendFriendRequest}
            />
          ))}
        </List>
      </Stack>
    </Dialog>
  );
};

export default Search;
