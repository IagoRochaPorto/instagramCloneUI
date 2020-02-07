import React, { useState, useEffect, useCallback } from 'react'
import { View, FlatList } from 'react-native'

import { Post, Header, Avatar, Name, Description, Loading } from './styles'
import LazyImage from '../../components/LazyImage'

export default function Feed() {
  const [feed, SetFeed] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [viewable, setViewable] = useState([])

  async function loadPage(pageNumber = page, shouldRefresh = false) {
    if(total && pageNumber > total) return

    setIsLoading(true)

    const response = await fetch(
      `http://localhost:3000/feed?_expand=author&_limit=5&_page=${pageNumber}`
    )

    const data = await response.json()
    const totalItems = response.headers.get('X-Total-Count')
 
    setTotal(Math.ceil(totalItems / 5))
    SetFeed(shouldRefresh ? data : [...feed, ...data])
    setPage(pageNumber + 1)
    setIsLoading(false)
  }

  useEffect(() => {
    loadPage()
  }, [])

  async function refreshList() {
    setIsRefreshing(true)

    await loadPage(1, true)

    setIsRefreshing(false)
  }

  const handleViewableChanged = useCallback(({ changed }) => {
    setViewable(changed.map(({ item }) => item.id))
  }, [])

  return (
    <View>
      <FlatList
        data={feed}
        keyExtractor={ post => String(post.id) }
        onEndReached={() => loadPage()}
        onEndReachedThreshold={0.1}
        onRefresh={refreshList}
        refreshing={isRefreshing}
        onViewableItemsChanged={handleViewableChanged}
        ListFooterComponent={isLoading && <Loading />}
        renderItem={({ item }) => (
          <Post>
            <Header>
              <Avatar source={{ uri: item.author.avatar }}/>
              <Name>{ item.author.name }</Name>
            </Header>

            <LazyImage 
              shouldLoad={viewable.includes(item.id)}
              aspectRatio={item.aspectRatio} 
              smallSource={{uri: item.small}}
              source={{ uri: item.image }}
            />

            <Description>
              <Name>{ item.author.name }</Name> { item.description }
            </Description>
          </Post>
        )}
        />
    </View>
  )
}